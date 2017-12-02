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
import { Ack, Subscriber } from "../../Reactive"
import { Scheduler, Throwable } from "funfix"

export default class DefaultIfEmptySubscriber<A> implements Subscriber<A> {
  private _isEmpty = true

  constructor(private readonly _out: Subscriber<A>,
              private readonly _defaultV: () => A,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isEmpty) {
      this._isEmpty = false
    }

    return this._out.onNext(elem)
  }

  onComplete(): void {
    if (this._isEmpty) {
      let streamErrors = true
      try {
        const value = this._defaultV()
        streamErrors = false

        this._out.onNext(value)
        this._out.onComplete()
      } catch (e) {
        if (streamErrors) {
          this._out.onError(e)
        }
      }
    }
  }

  onError(e: Throwable): void {
    this._out.onError(e)
  }
}
