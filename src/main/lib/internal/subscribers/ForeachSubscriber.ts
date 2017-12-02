import {Ack, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

export default class ForeachSubscriber<A> implements Subscriber<A> {
  private _isDone = false;

  constructor(private readonly _f: (a: A) => void,
              private readonly _onSuccess: () => void,
              private readonly _onFailure: (e: Throwable) => void,
              readonly scheduler: Scheduler) {
  }

  onNext(elem: A): Ack {
    try {
      this._f(elem);
      return Continue;
    } catch (e) {
      this.onError(e);
      return Stop;
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;
      this._onSuccess();
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;
      this._onFailure(e);
    }
  }
}
