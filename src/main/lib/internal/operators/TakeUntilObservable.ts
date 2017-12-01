import ObservableInstance from "../ObservableInstance";
import {Ack, Stop, Subscriber, SyncAck} from "../../Reactive";
import {Cancelable, Scheduler, Throwable, SingleAssignCancelable, StackedCancelable} from "funfix";


export default class TakeUntilObservable<A> extends ObservableInstance<A> {
  private _isComplete: boolean = false;

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _trigger: ObservableInstance<any>) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const mainConn = SingleAssignCancelable.empty();
    const isComplete = () => this._isComplete;
    const setComplete = (c: boolean) => {
      this._isComplete = c;
    };

    const selectorConn = this._trigger.unsafeSubscribeFn(new TriggerSubscriber(out, isComplete, setComplete, mainConn));

    mainConn.update(this._source.unsafeSubscribeFn(new MainSubscriber(out, isComplete, setComplete, selectorConn)));

    return StackedCancelable.collection(mainConn, selectorConn);
  }
}

class TriggerSubscriber<A> implements Subscriber<A> {

  constructor(private readonly _out: Subscriber<A>,
              private readonly _isComplete: () => boolean,
              private readonly _setComplete: (c: boolean) => void,
              private readonly _mainConn: Cancelable,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): SyncAck {
    this.signalComplete(null);
    return Stop;
  }

  onComplete(): void {
    this.signalComplete(null)
  }

  onError(e: Throwable): void {
    this.signalComplete(e);
  }

  private signalComplete(ex: Throwable | null): void {
    if (!this._isComplete()) {
      this._setComplete(true);
      this._mainConn.cancel();
      if (ex === null) {
        this._out.onComplete()
      } else {
        this._out.onError(ex);
      }
    } else if (ex !== null) {
      this.scheduler.reportFailure(ex);
    }
  }
}


class MainSubscriber<A> implements Subscriber<A> {
  constructor(private readonly _out: Subscriber<A>,
              private readonly _isComplete: () => boolean,
              private readonly _setComplete: (c: boolean) => void,
              private readonly _selectorConn: Cancelable,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isComplete()) {
      return Stop;
    } else {
      return Ack.syncOnStopOrFailure(this._out.onNext(elem), () => {
        this._setComplete(true);
        this._selectorConn.cancel();
      });
    }
  }

  onComplete(): void {
    this.signalComplete(null);
  }

  onError(e: Throwable): void {
    this.signalComplete(e);
  }

  private signalComplete(ex: Throwable | null): void {
    if (!this._isComplete()) {
      this._setComplete(true);
      this._selectorConn.cancel();
      if (ex === null) {
        this._out.onComplete();
      } else {
        this._out.onError(ex);
      }
    }
  }
}
