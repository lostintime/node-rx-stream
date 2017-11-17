import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";
import {Subscriber} from "../../../Reactive";

export default class BatchedBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A[]> {

  constructor(out: Subscriber<any>, size: number) {
    super(out, size);
  }

  protected fetchNext(): A[] | null {
    if (this.queue.length === 0) {
      return null;
    } else {
      const buffer = this.queue;
      this.queue = [];
      return buffer;
    }
  }
}
