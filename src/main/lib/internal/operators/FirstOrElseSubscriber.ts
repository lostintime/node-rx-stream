import {Ack, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Try, Throwable, Success, Failure} from 'funfix';

export default class FirstOrElseSubscriber<A> implements Subscriber<A> {
  private _isDone = false;

  constructor(private readonly _cb: (a: Try<A>) => void,
              private readonly _default: () => A,
              readonly scheduler: Scheduler) {
  }

  onNext(elem: A): Ack {
    if (!this._isDone) {
      this._isDone = true;
      this._cb(Success(elem));
    }
    return Stop;
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;
      this._cb(Try.of(this._default))
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;
      this._cb(Failure(e));
    }
  }
}
