import ObservableInstance from "../ObservableInstance";
import {AsyncAck, Cancelable, Continue, Stop, Subscriber} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";
import BooleanCancelable from "../cancelables/BooleanCancelable";
import {Scheduler} from 'funfix';


export default class RangeObservable extends ObservableInstance<number> {
  private readonly _from: number;
  private readonly _until: number;
  private readonly _step: number;
  private readonly _scheduler: Scheduler;

  constructor(from: number, to: number, step: number = 1, scheduler: Scheduler) {
    super();
    if (step == 0) {
      throw new Error('Invalid range step=0');
    }

    this._from = from;
    this._until = to;
    this._step = step;

    this._scheduler = scheduler;
  }

  unsafeSubscribeFn(subscriber: Subscriber<number>): Cancelable {
    // const s = subscriber.scheduler;
    if (!RangeObservable.isInRange(this._from, this._until, this._step)) {
      subscriber.onComplete();
      return new EmptyCancelable();
    } else {
      const cancelable = new BooleanCancelable();

      this.loop(cancelable, subscriber, this._from);

      return cancelable;
    }
  }

  private loop(cancelable: BooleanCancelable, downstream: Subscriber<number>, from: number): void {
    console.log('issue next: ', from);
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

  private asyncBoundary(cancelable: BooleanCancelable, ack: AsyncAck, downstream: Subscriber<number>, from: number): void {
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
