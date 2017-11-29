import {Ack, AsyncAck, Continue, Stop, Subscriber, SyncAck, Throwable} from "../../../Reactive";
import {Scheduler, FutureMaker, id} from 'funfix';

function nextPowerOf2(nr: number): number {
  if (nr < 0) {
    throw new Error("nr must be positive");
  }
  const bit = Math.ceil(Math.log2(nr));
  return 1 << (bit > 30 ? 30 : bit);
}

export default abstract class AbstractBackPressuredBufferedSubscriber<A, R> implements Subscriber<A> {
  private readonly _bufferSize: number;

  private _upstreamIsComplete: boolean = false;
  private _downstreamIsComplete: boolean = false;
  private _errorThrown: Throwable | null = null;
  private _isLoopActive: boolean = false;
  private _backPressured: FutureMaker<SyncAck> | null = null;
  private _lastIterationAck: Ack = Continue;
  protected _queue: A[] = [];

  constructor(size: number,
              private readonly _out: Subscriber<R>,
              readonly scheduler: Scheduler = _out.scheduler) {
    if (size < 0) {
      throw new Error("bufferSize must be a strictly positive number");
    }

    this._bufferSize = nextPowerOf2(size);
  }

  onNext(elem: A): Ack {
    if (this._upstreamIsComplete || this._downstreamIsComplete) {
      return Stop;
    } else if (this._backPressured === null) {
      if (this._queue.length < this._bufferSize) {
        this._queue.push(elem);
        this.pushToConsumer();

        return Continue
      } else {
        this._backPressured = FutureMaker.empty(this.scheduler);
        this._queue.push(elem);
        this.pushToConsumer();

        return this._backPressured.future();
      }
    } else {
      this._queue.push(elem);
      this.pushToConsumer();

      return this._backPressured.future()
    }
  }

  onError(e: Throwable): void {
    if (!this._upstreamIsComplete && !this._downstreamIsComplete) {
      this._errorThrown = e;
      this._upstreamIsComplete = true;
      this.pushToConsumer()
    }
  }

  onComplete(): void {
    if (!this._upstreamIsComplete && !this._downstreamIsComplete) {
      this._upstreamIsComplete = true;
      this.pushToConsumer()
    }
  }

  private pushToConsumer(): void {
    if (!this._isLoopActive) {
      this._isLoopActive = true;
      this.scheduler.trampoline(this.consumerRunLoop.bind(this))
    }
  }

  protected abstract fetchNext(): R | null;

  private consumerRunLoop(): void {
    this.fastLoop(this._lastIterationAck)
  }

  private signalNext(next: R): Ack {
    try {
      const ack = this._out.onNext(next);
      // Tries flattening the Ack to a
      // synchronous value
      if (ack === Continue || ack === Stop) {
        // SyncAck
        return ack;
      } else {
        // AsyncAck
        return ack.value() // Option<Try<SyncAck>>
          .fold((): Ack => {
            return ack; // None
          }, (v): Ack => { // Some<Try<SyncAck>>
            return v.fold((e) => {
              this.downstreamSignalComplete(e);
              return Stop;
            }, id)
          });
      }
    } catch (ex) {
      this.downstreamSignalComplete(ex);
      return Stop;
    }
  }

  private downstreamSignalComplete(ex: Throwable | null = null): void {
    this._downstreamIsComplete = true;
    try {
      if (ex !== null)
        this._out.onError(ex);
      else
        this._out.onComplete();
    } catch (err) {
      this.scheduler.reportFailure(err)
    }
  }

  private goAsync(next: R, ack: AsyncAck): void {
    ack.onComplete((r) => {
      r.fold((ex) => {
        this._isLoopActive = false;
        this.downstreamSignalComplete(ex);
      }, (a) => {
        if (a === Continue) {
          const nextAck = this.signalNext(next);
          this.fastLoop(nextAck)
        } else {
          // ending loop
          this._downstreamIsComplete = true;
          this._isLoopActive = false
        }
      });
    })
  }

  stopStreaming(): void {
    this._downstreamIsComplete = true;
    this._isLoopActive = false;
    if (this._backPressured !== null) {
      this._backPressured.success(Stop);
      this._backPressured = null
    }
  }

  private fastLoop(prevAck: Ack): void {
    let ack = prevAck;
    let streamErrors = true;

    try {
      while (this._isLoopActive && !this._downstreamIsComplete) {
        const next = this.fetchNext();

        if (next !== null) {
          // there is room for 1 more
          if (this._backPressured !== null && ack !== Stop) {
            this._backPressured.success(this._upstreamIsComplete ? Stop : Continue);
            this._backPressured = null
          }

          if (ack === Continue) {
            ack = this.signalNext(next);
            if (ack === Stop) {
              this.stopStreaming();
              return
            }
          } else if (ack === Stop) {
            this.stopStreaming();
            return
          } else {
            this.goAsync(next, ack);
            return;
          }
        } else {
          // Ending loop
          if (this._backPressured !== null) {
            this._backPressured.success(this._upstreamIsComplete ? Stop : Continue);
            this._backPressured = null
          }

          streamErrors = false;
          if (this._upstreamIsComplete) {
            this.downstreamSignalComplete(this._errorThrown);
          }

          this._lastIterationAck = ack;
          this._isLoopActive = false;
          return
        }
      }
    } catch (ex) {
      if (streamErrors) {
        this.downstreamSignalComplete(ex);
      } else {
        this.scheduler.reportFailure(ex);
      }

      this._lastIterationAck = Stop;
      this._isLoopActive = false
    }
  }
}
