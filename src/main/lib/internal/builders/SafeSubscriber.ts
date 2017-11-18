import {Ack, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';

/**
 * FIXME implement it safely!
 */
export default class SafeSubscriber<T> implements Subscriber<T> {
  constructor(private readonly _subscriber: Subscriber<T>,
              readonly scheduler: Scheduler = _subscriber.scheduler) {
  }

  onComplete(): void {
    this._subscriber.onComplete();
  }

  onError(e: Throwable): void {
    this._subscriber.onError(e);
  }

  onNext(t: T): Ack {
    return this._subscriber.onNext(t);
  }
}
