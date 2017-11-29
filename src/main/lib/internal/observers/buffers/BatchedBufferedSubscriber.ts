import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";
import {Subscriber} from "../../../Reactive";
import {Scheduler} from 'funfix';

export default class BatchedBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A[]> {

  constructor(size: number, out: Subscriber<any>, scheduler: Scheduler = out.scheduler) {
    super(size, out, scheduler);
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
