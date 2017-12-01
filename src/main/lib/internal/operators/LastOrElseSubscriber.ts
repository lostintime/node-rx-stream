import {Ack, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Try, Throwable, Success, Failure} from 'funfix';

export default class LastOrElseSubscriber<A> implements Subscriber<A> {
  private _isEmpty = true;
  private value: A;

  constructor(private readonly _cb: (a: Try<A>) => void,
              private readonly _default: () => A,
              readonly scheduler: Scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isEmpty) {
      this._isEmpty = false;
    }
    this.value = elem;

    return Continue;
  }

  onComplete(): void {
    if (this._isEmpty) {
      this._cb(Try.of(this._default));
    } else {
      this._cb(Success(this.value));
    }
  }

  onError(e: Throwable): void {
    this._cb(Failure(e));
  }
}
