import {Ack, Stop, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from "funfix";

export default class TakeByPredicateSubscriber<A> implements Subscriber<A> {
  private _isActive = true;

  constructor(private readonly _pred: (elem: A) => boolean,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (!this._isActive) {
      return Stop;
    } else {
      let streamError = true;
      try {
        const isValid = this._pred(elem);
        streamError = false;

        if (isValid) {
          return this._out.onNext(elem);
        } else {
          this._isActive = false;
          this._out.onComplete();
          return Stop;
        }
      } catch (e) {
        if (streamError) {
          this.onError(e)
        }
        return Stop;
      }
    }
  }

  onComplete(): void {
    if (this._isActive) {
      this._isActive = false;
      this._out.onComplete();
    }
  }

  onError(e: Throwable): void {
    if (this._isActive) {
      this._isActive = false;
      this._out.onError(e);
    }
  }
}
