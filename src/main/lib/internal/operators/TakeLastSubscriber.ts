import {Ack, Continue, Stop, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';
import Observable from "../../Observable";

export default class TakeLastSubscriber<A> implements Subscriber<A> {
  private _queue: Array<A> = [];

  constructor(private readonly _n: number,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._n <= 0) {
      return Stop;
    } else if (this._queue.length < this._n) {
      this._queue.push(elem);

      return Continue;
    } else {
      this._queue.push(elem);
      this._queue.shift();

      return Continue;
    }
  }

  onComplete(): void {
    Observable.fromArray(this._queue).unsafeSubscribeFn(this._out);
  }

  onError(e: Throwable): void {
    this._out.onError(e);
  }
}
