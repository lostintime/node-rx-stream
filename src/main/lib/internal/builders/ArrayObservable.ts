import ObservableInstance from "../ObservableInstance";
import {AsyncAck, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Cancelable, IBoolCancelable, BoolCancelable} from 'funfix';


export default class ArrayObservable<A>  extends ObservableInstance<A> {

  constructor(private readonly _arr: Array<A>,
              private readonly _scheduler: Scheduler) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    // const s = subscriber.scheduler;
    if (this._arr.length <= 0) {
      subscriber.onComplete();
      return Cancelable.empty();
    } else {
      const cancelable = BoolCancelable.empty();

      this.loop(cancelable, subscriber, 0);

      return cancelable;
    }
  }

  private loop(cancelable: IBoolCancelable, downstream: Subscriber<A>, from: number): void {
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

  private asyncBoundary(cancelable: IBoolCancelable, ack: AsyncAck, downstream: Subscriber<A>, from: number): void {
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
