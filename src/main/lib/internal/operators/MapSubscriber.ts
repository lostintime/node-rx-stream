import {Ack, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';


export default class MapSubscriber<A, B> implements Subscriber<A> {
  private _isDone: boolean = false;

  constructor(private readonly _fn: (a: A) => B,
              private readonly _out: Subscriber<B>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    let streamError = true;
    try {
      const next = this._fn(elem);
      streamError = false;
      return this._out.onNext(next);
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
