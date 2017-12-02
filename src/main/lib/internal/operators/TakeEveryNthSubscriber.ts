import {Ack, Continue, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

export default class TakeEveryNthSubscriber<A> implements Subscriber<A> {
  private _index: number;

  constructor(private readonly _out: Subscriber<A>,
              private readonly _n: number,
              readonly scheduler: Scheduler = _out.scheduler) {
    if (_n <= 0) {
      throw new Error('n must be strictly positive');
    }
    this._index = _n;
  }

  onNext(elem: A): Ack {
    this._index -= 1;
    if (this._index != 0) {
      return Continue;
    } else {
      this._index = this._n;
      return this._out.onNext(elem);
    }
  }

  onComplete(): void {
    this._out.onComplete();
  }

  onError(e: Throwable): void {
    this._out.onError(e);
  }
}
