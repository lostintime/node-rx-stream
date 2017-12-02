import {Ack, Continue, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

export default class DropFirstSubscriber<A> implements Subscriber<A> {
  private _count: number = 0;

  constructor(private readonly _n: number,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._count < this._n) {
      this._count += 1;
      return Continue;
    } else {
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
