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
  private readonly out: Subscriber<R>;
  private readonly bufferSize: number;
  readonly scheduler: Scheduler;

  private upstreamIsComplete: boolean = false;
  private downstreamIsComplete: boolean = false;
  private errorThrown: Throwable | null = null;
  private isLoopActive: boolean = false;
  private backPressured: FutureMaker<SyncAck> | null = null;
  private lastIterationAck: Ack = Continue;
  protected queue: A[] = [];

  constructor(out: Subscriber<R>, size: number) {
    if (size < 0) {
      throw new Error("bufferSize must be a strictly positive number");
    }

    this.out = out;
    this.bufferSize = nextPowerOf2(size);
    this.scheduler = out.scheduler;
  }

  onNext(elem: A): Ack {
    if (this.upstreamIsComplete || this.downstreamIsComplete) {
      return Stop;
    } else {
      if (this.backPressured === null) {
        if (this.queue.length < this.bufferSize) {
          this.queue.push(elem);
          this.pushToConsumer();

          return Continue
        } else {
          this.backPressured = FutureMaker.empty(this.scheduler);
          this.queue.push(elem);
          this.pushToConsumer();

          return this.backPressured.future();
        }
      } else {
        this.queue.push(elem);
        this.pushToConsumer();

        return this.backPressured.future()
      }
    }
  }

  onError(e: Throwable): void {
    if (!this.upstreamIsComplete && !this.downstreamIsComplete) {
      this.errorThrown = e;
      this.upstreamIsComplete = true;
      this.pushToConsumer()
    }
  }

  onComplete(): void {
    if (!this.upstreamIsComplete && !this.downstreamIsComplete) {
      this.upstreamIsComplete = true;
      this.pushToConsumer()
    }
  }

  private pushToConsumer(): void {
    if (!this.isLoopActive) {
      this.isLoopActive = true;
      this.scheduler.executeBatched(this.consumerRunLoop)
    }
  }

  protected abstract fetchNext(): R | null;

  private consumerRunLoop(): void {

  }

  private signalNext(next: R): Ack {
    try {
      const ack = this.out.onNext(next);
      // Tries flattening the Future[Ack] to a
      // synchronous value
      if (ack === Continue || ack === Stop) {
        return ack;
      } else {
        return ack.value() // Option<Try<SyncAck>>
          .fold((): Ack => {
            return ack; // None
          }, (v): Ack => { // Some<Try<SyncAck>>
            return v.fold((e) => { // failure
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
    this.downstreamIsComplete = true;
    try {
      if (ex != null)
        this.out.onError(ex);
      else
        this.out.onComplete();
    } catch (err) {
      this.scheduler.reportFailure(err)
    }
  }

  private goAsync(next: R, ack: AsyncAck): void {
    ack.onComplete((r) => {
      r.fold((ex) => {
        this.isLoopActive = false;
        this.downstreamSignalComplete(ex);
      }, (a) => {
        if (a === Continue) {
          const nextAck = this.signalNext(next);
          // const isSync = ack === Continue || ack === Stop;
          this.fastLoop(nextAck)
        } else {
          // ending loop
          this.downstreamIsComplete = true;
          this.isLoopActive = false
        }
      });
    })
  }

  stopStreaming(): void {
    this.downstreamIsComplete = true;
    this.isLoopActive = false;
    if (this.backPressured !== null) {
      this.backPressured.success(Stop);
      this.backPressured = null
    }
  }

  private fastLoop(prevAck: Ack): void {
    let ack = prevAck;
    let streamErrors = true;

    try {
      while (this.isLoopActive && !this.downstreamIsComplete) {
        const next = this.fetchNext();

        if (next !== null) {
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
          }
        } else {
          // Ending loop
          if (this.backPressured !== null) {
            this.backPressured.success(this.upstreamIsComplete ? Stop : Continue);
            this.backPressured = null
          }

          streamErrors = false;
          if (this.upstreamIsComplete) {
            this.downstreamSignalComplete(this.errorThrown);
          }

          this.lastIterationAck = ack;
          this.isLoopActive = false;
          return
        }
      }
    } catch (ex) {
      if (streamErrors) {
        this.downstreamSignalComplete(ex);
      } else {
        this.scheduler.reportFailure(ex);
      }

      this.lastIterationAck = Stop;
      this.isLoopActive = false
    }
  }
}
