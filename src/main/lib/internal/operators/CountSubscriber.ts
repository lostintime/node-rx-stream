import {Ack, Continue, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from "funfix";


export default class CountSubscriber<A> implements Subscriber<A> {
  private _count: number = 0;

  constructor(private readonly _out: Subscriber<number>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._count += 1;
    return Continue;
  }

  onComplete(): void {
    this._out.onNext(this._count);
    this._out.onComplete();
  }

  onError(e: Throwable): void {
    this._out.onError(e);
  }
}
