import ObservableInstance from "../ObservableInstance";
import {AsyncAck, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, IBoolCancelable, BoolCancelable, Cancelable} from 'funfix';


export default class RangeObservable extends ObservableInstance<number> {
  constructor(private readonly _from: number,
              private readonly _until: number,
              private readonly _step: number = 1,
              private readonly _scheduler: Scheduler) {
    super();
    if (_step == 0) {
      throw new Error('Invalid range step=0');
    }
  }

  unsafeSubscribeFn(subscriber: Subscriber<number>): Cancelable {
    // const s = subscriber.scheduler;
    if (!RangeObservable.isInRange(this._from, this._until, this._step)) {
      subscriber.onComplete();
      return Cancelable.empty();
    } else {
      const cancelable = BoolCancelable.empty();

      this.loop(cancelable, subscriber, this._from);

      return cancelable;
    }
  }

  private loop(cancelable: IBoolCancelable, downstream: Subscriber<number>, from: number): void {
    const ack = downstream.onNext(from);
    const nextFrom = from + this._step;

    if (!RangeObservable.isInRange(nextFrom, this._until, this._step)) {
      downstream.onComplete();
    } else {
      if (ack === Continue) {
        this._scheduler.trampoline(() => {
          this.loop(cancelable, downstream, nextFrom);
        });
      } else if (ack === Stop) {
        // do nothing, done here
      } else {
        if (!cancelable.isCanceled()) {
          this.asyncBoundary(cancelable, ack, downstream, nextFrom);
        }
      }
    }
  }

  private asyncBoundary(cancelable: IBoolCancelable, ack: AsyncAck, downstream: Subscriber<number>, from: number): void {
    ack.onComplete((r) => {
      r.fold((e) => {
        downstream.onError(e);
      }, (a) => {
        if (a === Continue) {
          this.loop(cancelable, downstream, from)
        } else {
          // done, got Stop signal
        }
      });
    });
  }

  private static isInRange(x: number, until: number, step: number): boolean {
    return (step > 0 && x < until) || (step < 0 && x > until);
  }
}
