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
import { Ack, Continue, Subscriber } from "../../Reactive"
import { Scheduler, Throwable } from "funfix"

export default class DropFirstSubscriber<A> implements Subscriber<A> {
  private _count: number = 0

  constructor(private readonly _n: number,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._count < this._n) {
      this._count += 1
      return Continue
    } else {
      return this._out.onNext(elem)
    }
  }

  onComplete(): void {
    this._out.onComplete()
  }

  onError(e: Throwable): void {
    this._out.onError(e)
  }
}
