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
import { Ack, Stop, Subscriber } from "../../Reactive"
import { Scheduler, Try, Throwable, Success, Failure } from "funfix"

export default class FirstOrElseSubscriber<A> implements Subscriber<A> {
  private _isDone = false

  constructor(private readonly _cb: (a: Try<A>) => void,
              private readonly _default: () => A,
              readonly scheduler: Scheduler) {
  }

  onNext(elem: A): Ack {
    if (!this._isDone) {
      this._isDone = true
      this._cb(Success(elem))
    }
    return Stop
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true
      this._cb(Try.of(this._default))
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true
      this._cb(Failure(e))
    }
  }
}
