import ObservableInstance from "../ObservableInstance";
import {Throwable, Cancelable, MultiAssignCancelable, Scheduler} from 'funfix';
import {Ack, Continue, Subscriber} from "../../Reactive";


export default class OnErrorRecoverWithObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _fn: (e: Throwable) => ObservableInstance<A>) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const cancelable = MultiAssignCancelable.empty();

    const main = this._source.unsafeSubscribeFn(new OnErrorRecoverWithSubscriber(out, cancelable, this._fn));

    return cancelable.update(main);
  }
}

class OnErrorRecoverWithSubscriber<A> implements Subscriber<A> {
  private _ack: Ack = Continue;

  constructor(private readonly _out: Subscriber<A>,
              private readonly _cancelable: MultiAssignCancelable,
              private readonly _fn: (e: Throwable) => ObservableInstance<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._ack = this._out.onNext(elem);
    return this._ack;
  }

  onComplete(): void {
    this._out.onComplete();
  }

  onError(e: Throwable): void {
    let streamError = true;
    try {
      const fallbackTo = this._fn(e);
      streamError = false;

      this.scheduler.trampoline(() => {
        Ack.syncOnContinue(this._ack, () => {
          this._cancelable.update(fallbackTo.unsafeSubscribeFn(this._out))
        })
      });
    } catch (e) {
      if (streamError) {
        this._out.onError(e);
      } else {
        this.scheduler.reportFailure(e);
      }
    }
  }
}
