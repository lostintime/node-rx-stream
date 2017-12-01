import {Ack, Continue, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

export default class SubscriberWrap<A> implements Subscriber<A> {
  readonly scheduler: Scheduler;

  constructor(private readonly nextFn?: (elem: A) => Ack,
              private readonly errorFn?: (e: Throwable) => void,
              private readonly completeFn?: () => void,
              scheduler?: Scheduler) {
    this.scheduler = scheduler || Scheduler.global.get();
  }

  onNext(elem: A): Ack {
    if (this.nextFn) {
      return this.nextFn(elem);
    }

    return Continue;
  }

  onComplete(): void {
    if (this.completeFn) {
      this.completeFn()
    }
  }

  onError(e: Throwable): void {
    if (this.errorFn) {
      this.errorFn(e);
    }
  }
}
