/*
 * Copyright (c) 2017 by The RxStream Project Developers.
 * Some rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Buffer from "./Buffer"

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
