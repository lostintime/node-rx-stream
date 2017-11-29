import {Ack, Continue, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';

export default class FailedSubscriber<A> implements Subscriber<A> {

  constructor(private readonly _out: Subscriber<Throwable>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    return Continue;
  }

  onComplete(): void {
    this._out.onComplete();
  }

  onError(e: Throwable): void {
    this._out.onNext(e);
    this._out.onComplete();
  }
}
