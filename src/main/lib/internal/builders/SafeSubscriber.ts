/**
 * FIXME implement it safely!
 */
import {Ack, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';

export default class SafeSubscriber<T> implements Subscriber<T> {
  private readonly _subscriber: Subscriber<T>;
  readonly scheduler: Scheduler;

  constructor(unsafeSubscriber: Subscriber<T>) {
    this._subscriber = unsafeSubscriber;
    this.scheduler = unsafeSubscriber.scheduler
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
