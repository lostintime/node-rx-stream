import {Ack, Continue, Stop, Subscriber, SyncAck, ackSyncOnContinue} from "../../Reactive";
import {Scheduler, Try, FutureMaker, Throwable} from 'funfix';


export default class SafeSubscriber<T> implements Subscriber<T> {
  private _isDone: boolean = false;
  private _ack: Ack = Continue;

  constructor(private readonly _subscriber: Subscriber<T>,
              readonly scheduler: Scheduler = _subscriber.scheduler) {
  }

  onNext(elem: T): Ack {
    if (!this._isDone) {
      try {
        this._ack = this.flattenAndCatchFailures(this._subscriber.onNext(elem));
      } catch (e) {
        this.onError(e);
        this._ack = Stop;
      }

      return this._ack;
    } else {
      return Stop;
    }
  }

  onComplete(): void {
    ackSyncOnContinue(this._ack, () => {
      if (!this._isDone) {
        this._isDone = true;

        try {
          this._subscriber.onComplete();
        } catch (e) {
          this.scheduler.reportFailure(e);
        }
      }
    });
  }

  onError(e: Throwable): void {
    ackSyncOnContinue(this._ack, () => this.signalError(e));
  }

  private flattenAndCatchFailures(ack: Ack): Ack {
    // Fast path.
    if (ack === Continue) {
      return Continue;
    } else if (ack === Stop) {
      this._isDone = true;
      return Stop;
    } else {
      return ack.value().fold((): Ack => {
        const p = FutureMaker.empty<SyncAck>();
        ack.onComplete((result: Try<SyncAck>) => {
          p.success(this.handleFailure(result));
        });

        return p.future();
      }, (result): Ack => this.handleFailure(result));
    }
  }

  private signalError(ex: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;

      try {
        this._subscriber.onError(ex);
      } catch (e) {
        this.scheduler.reportFailure(e);
      }
    }
  }

  private handleFailure(value: Try<SyncAck>): SyncAck {
    try {
      const ack = value.get();
      if (ack === Stop) {
        this._isDone = true;
      }

      return ack;
    } catch (e) {
      this.signalError(value.failed().get());

      return Stop;
    }
  }
}
