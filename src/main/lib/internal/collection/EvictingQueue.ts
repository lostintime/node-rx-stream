import Buffer from './Buffer';

export default interface EvictingQueue<A> extends Buffer<A> {
  /**
   * Returns the capacity of this queue.
   */
  capacity(): number

  /**
   * Returns true if the queue is at capacity.
   */
  isAtCapacity(): boolean

  /** Pushes a new element in the queue. On overflow, it starts
   * to evict old elements from the queue.
   *
   * @return the number of elements that were evicted in case of
   *         overflow or zero otherwise
   */
  offer(elem: A): number

  /** Pushes the given sequence of elements on the queue. On overflow,
   * it starts to evict old elements from the queue.
   */
  offerMany(...seq: A[]): number

  /** Returns the first element in the queue, and removes this element
   * from the queue.
   *
   * @return the first element of the queue or `undefined` if empty
   */
  poll(): A | undefined
}
