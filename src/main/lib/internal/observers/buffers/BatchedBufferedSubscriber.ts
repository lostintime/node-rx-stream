import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";
import {Subscriber} from "../../../Reactive";
import {Scheduler} from 'funfix';

export default class BatchedBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A[]> {

  constructor(out: Subscriber<any>, size: number, scheduler: Scheduler = out.scheduler) {
    super(out, size, scheduler);
  }

  protected fetchNext(): A[] | null {
    if (this._queue.length === 0) {
      return null;
    } else {
      const buffer = this._queue;
      this._queue = [];
      return buffer;
    }
  }
}
