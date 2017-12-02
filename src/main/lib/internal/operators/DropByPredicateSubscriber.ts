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

export default class DropByPredicateSubscriber<A> implements Subscriber<A> {
  private _continueDropping: boolean = true
  private _isDone: boolean = false

  constructor(private readonly _pred: (elem: A) => boolean,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._continueDropping) {
      let streamError = true
      try {
        const isStillInvalid = this._pred(elem)
        streamError = false

        if (isStillInvalid) {
          return Continue
        } else {
          this._continueDropping = false
          return this._out.onNext(elem)
        }
      } catch (e) {
        if (streamError) {
          this.onError(e)
        }

        return Stop
      }
    } else {
      return this._out.onNext(elem)
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true
      this._out.onComplete()
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true
      this.onError(e)
    }
  }
}
