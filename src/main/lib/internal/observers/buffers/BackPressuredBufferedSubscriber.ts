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
import { Subscriber } from "../../../Reactive"
import AbstractBackPressuredBufferedSubscriber from "./AbstractBackPressuredBufferedSubscriber"
import { Scheduler } from "funfix"

export default class BackPressuredBufferedSubscriber<A> extends AbstractBackPressuredBufferedSubscriber<A, A> {
  constructor(size: number, out: Subscriber<A>, scheduler: Scheduler = out.scheduler) {
    super(size, out, scheduler)
  }

  protected fetchNext(): A | null {
    const next = this._queue.shift()
    if (next !== undefined) {
      return next
    }

    return null
  }
}
