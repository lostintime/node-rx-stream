import ObservableInstance from "../ObservableInstance";
import {Cancelable, Continue, Stop, Subscriber, SyncAck} from "../../Reactive";
import BooleanCancelable from "../cancelables/BooleanCancelable";
import {Future, Scheduler} from 'funfix';


export default class LoopObservable extends ObservableInstance<number> {
  constructor(private readonly _scheduler: Scheduler) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<number>): Cancelable {
    const cancelable = new BooleanCancelable();

    this.loop(cancelable, subscriber, 0);

    return cancelable;
  }

  private loop(cancelable: BooleanCancelable, downstream: Subscriber<number>, from: number): void {
    const ack = downstream.onNext(from);
    const nextFrom = from + 1;

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

  private asyncBoundary(cancelable: BooleanCancelable, ack: Future<SyncAck>, downstream: Subscriber<number>, from: number): void {
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
