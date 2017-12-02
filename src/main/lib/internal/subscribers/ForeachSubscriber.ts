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
import { Ack, Continue, Stop, Subscriber } from "../../Reactive"
import { Scheduler, Throwable } from "funfix"

export default class ForeachSubscriber<A> implements Subscriber<A> {
  private _isDone = false

  constructor(private readonly _f: (a: A) => void,
              private readonly _onSuccess: () => void,
              private readonly _onFailure: (e: Throwable) => void,
              readonly scheduler: Scheduler) {
  }

  onNext(elem: A): Ack {
    try {
      this._f(elem)
      return Continue
    } catch (e) {
      this.onError(e)
      return Stop
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true
      this._onSuccess()
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true
      this._onFailure(e)
    }
  }
}
