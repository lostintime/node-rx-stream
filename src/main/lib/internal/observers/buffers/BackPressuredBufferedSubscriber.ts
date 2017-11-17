import {Subscriber} from "../../../Reactive";
import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber";

export default class BackPressuredBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A> {
  constructor(out: Subscriber<A>, size: number) {
    super(out, size);
  }

  protected fetchNext(): A | null {
    const next = this.queue.shift();
    if (next !== undefined) {
      return next;
    }

    return null;
  }
}
