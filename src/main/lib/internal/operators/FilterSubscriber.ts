import {Ack, Continue, Stop, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';


export default class FilterSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false;

  constructor(private readonly _fn: (a: A) => boolean,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    let streamError = true;
    try {
      if (this._fn(elem)) {
        streamError = false;
        return this._out.onNext(elem);
      }

      return Continue;
    } catch (e) {
      if (streamError) {
        this.onError(e);
        return Stop
      }

      throw e;
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;
      this._out.onComplete();
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;
      this._out.onError(e);
    }
  }
}
