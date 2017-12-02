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
