/**
 * FIXME implement it safely!
 */
import {Ack, Subscriber, Subscription, Throwable} from "../../Reactive";

export default class SafeSubscriber<T> implements Subscriber<T> {
  private readonly _subscriber: Subscriber<T>;

  constructor(unsafeSubscriber: Subscriber<T>) {
    this._subscriber = unsafeSubscriber;
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

  onSubscribe(s: Subscription): void {
    this._subscriber.onSubscribe(s);
  }
}
