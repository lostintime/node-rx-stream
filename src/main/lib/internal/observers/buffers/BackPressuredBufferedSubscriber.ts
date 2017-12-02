import {Subscriber} from "../../../Reactive";
import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";
import {Scheduler} from 'funfix';

export default class BackPressuredBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A> {
  constructor(size: number, out: Subscriber<A>, scheduler: Scheduler = out.scheduler) {
    super(size, out, scheduler);
  }

  protected fetchNext(): A | null {
    const next = this._queue.shift();
    if (next !== undefined) {
      return next;
    }

    return null;
  }
}
