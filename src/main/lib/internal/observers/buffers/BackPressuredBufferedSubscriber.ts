import {Subscriber} from "../../../Reactive";
import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";
import {Scheduler} from 'funfix';

export default class BackPressuredBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A> {
  constructor(out: Subscriber<A>, size: number, scheduler: Scheduler = out.scheduler) {
    super(out, size, scheduler);
  }

  protected fetchNext(): A | null {
    const next = this._queue.shift();
    if (next !== undefined) {
      return next;
    }

    return null;
  }
}
