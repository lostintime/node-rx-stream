import EvictingQueue from "./EvictingQueue";
import {Throwable} from 'funfix';
import {nextPowerOf2} from "../math";

export default class ArrayQueue<A> implements EvictingQueue<A> {
  private _queue: A[] = [];
  private _offset = 0;
  private readonly _bufferSize: number;

  constructor(private readonly _size: number,
              private readonly _triggerEx?: (n: number) => Throwable ) {
    this._bufferSize = _size < 0 ? 0 : nextPowerOf2(_size);
  }

  capacity(): number {
    return this._bufferSize == 0 ? Number.POSITIVE_INFINITY : this._bufferSize;
  }

  isAtCapacity(): boolean {
    return (this._queue.length - this._offset) >= this.capacity();
  }

  offer(elem: A): number {
    if (elem === undefined) {
      throw new Error('undefined not supported');
    }

    if (this._bufferSize > 0 && this._queue.length - this._offset >= this.capacity()) {
      if (this._triggerEx) {
        throw this._triggerEx(this.capacity());
      }
      return 1;
    } else {
      this._queue.push(elem);
      return 0;
    }
  }

  offerMany(...seq: Array<A>): number {
    let acc = 0;
    seq.forEach((el) => {
      acc += this.offer(el);
    });

    return acc;
  }

  poll(): undefined | A {
    return this._queue.shift();
  }

  clear(): void {
  }

  length(): number {
    return this._queue.length - this._offset;
  }

  isEmpty(): boolean {
    return this._queue.length - this._offset == 0;
  }

  nonEmpty(): boolean {
    return this._queue.length - this._offset > 0;
  }

  size(): number {
    return this.length();
  }

  static unbounded<A>(): ArrayQueue<A> {
    return new ArrayQueue(0);
  }

  static bounded<A>(bufferSize: number, triggerEx?: (n: number) => Throwable): ArrayQueue<A> {
    return new ArrayQueue(bufferSize, triggerEx);
  }
}
