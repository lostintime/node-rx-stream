import ObservableInstance from "../ObservableInstance";
import {Ack, AsyncAck, Cancelable, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Future, IBoolCancelable, BoolCancelable} from "funfix";

export default class RepeatEvalObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _eval: () => A) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    const s = subscriber.scheduler;
    const cancelable = BoolCancelable.empty();
    this.fastLoop(subscriber, cancelable, s);
    return cancelable;
  }

  private reschedule(ack: AsyncAck, o: Subscriber<A>, c: IBoolCancelable, s: Scheduler) {
    ack.onComplete(r => {
      r.fold((e) => {
        s.reportFailure(e)
      }, a => {
        if (a === Continue) {
          this.fastLoop(o, c, s);
        }
      })
    })
  }

  private fastLoop(o: Subscriber<A>, c: IBoolCancelable, s: Scheduler): void {
    let ack: Ack;
    try {
      ack = o.onNext(this._eval());
    } catch (e) {
      ack = Future.raise(e);
    }

    if (ack === Continue) {
      // tailrec call here
      s.trampoline(() => {
        this.fastLoop(o, c, s);
      });
    } else if (ack !== Stop && !c.isCanceled()) {
      this.reschedule(ack, o, c, s)
    }
  }
}
