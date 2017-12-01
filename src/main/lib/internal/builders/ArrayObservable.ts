import ObservableInstance from "../ObservableInstance";
import {AsyncAck, Cancelable, Continue, Stop, Subscriber} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";
import BooleanCancelable, {IBooleanCancelable} from "../cancelables/BooleanCancelable";
import {Scheduler} from 'funfix';

export default class ArrayObservable<A>  extends ObservableInstance<A> {

  constructor(private readonly _arr: Array<A>,
              private readonly _scheduler: Scheduler) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    // const s = subscriber.scheduler;
    if (this._arr.length <= 0) {
      subscriber.onComplete();
      return EmptyCancelable;
    } else {
      const cancelable = BooleanCancelable();

      this.loop(cancelable, subscriber, 0);

      return cancelable;
    }
  }

  private loop(cancelable: IBooleanCancelable, downstream: Subscriber<A>, from: number): void {
    const next = this._arr[from];
    if (next !== undefined) {
      const ack = downstream.onNext(next);
      const nextFrom = from + 1;

      if (nextFrom >= this._arr.length) {
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
    } else {
      downstream.onComplete();
    }
  }

  private asyncBoundary(cancelable: IBooleanCancelable, ack: AsyncAck, downstream: Subscriber<A>, from: number): void {
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
}
