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

export default class TakeEveryNthSubscriber<A> implements Subscriber<A> {
  private _index: number

  constructor(private readonly _out: Subscriber<A>,
              private readonly _n: number,
              readonly scheduler: Scheduler = _out.scheduler) {
    if (_n <= 0) {
      throw new Error("n must be strictly positive")
    }
    this._index = _n
  }

  onNext(elem: A): Ack {
    this._index -= 1
    if (this._index !== 0) {
      return Continue
    } else {
      this._index = this._n
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
