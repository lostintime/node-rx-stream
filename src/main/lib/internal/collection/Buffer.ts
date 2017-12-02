export default interface Buffer<A> {
  /**
   * Pushes a new element in the queue. Depending on
   * implementation, on overflow it might start to evict
   * old elements from the queue.
   *
   * @return the number of elements that were evicted in case of
   *         overflow or zero otherwise
   */
  offer(elem: A): number

  /**
   * Pushes the given sequence on the queue. Depending on
   * implementation, on overflow it might start to evict
   * old elements from the queue.
   *
   * @return the number of elements that were evicted in case of
   *         overflow or zero otherwise
   */
  offerMany(...seq: Array<A>): number

  /**
   * Clears all items in this buffer leaving it empty.
   */
  clear(): void

  /** Returns the number of elements stored */
  length(): number

  /** Returns the number of elements stored */
  size(): number
}
