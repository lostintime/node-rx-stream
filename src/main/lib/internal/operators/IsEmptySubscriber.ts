import {Ack, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

export default class IsEmptySubscriber<A> implements Subscriber<A> {
  private _isDone = false;
  private _isEmpty = true;

  constructor(private readonly _out: Subscriber<boolean>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._isEmpty = false;
    this.onComplete();
    return Stop;
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;
      this._out.onNext(this._isEmpty);
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
