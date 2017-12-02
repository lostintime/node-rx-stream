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
import ObservableInstance from "../ObservableInstance"
import { Ack, Stop, Subscriber } from "../../Reactive"
import { Scheduler, Cancelable, Throwable } from "funfix"

class ScanSubscriber<A, R> implements Subscriber<A> {
  private _isDone: boolean = false

  constructor(private _state: R,
              private readonly _fn: (r: R, a: A) => R,
              private readonly _out: Subscriber<R>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    let streamError = true
    try {
      this._state = this._fn(this._state, elem)
      streamError = false
      return this._out.onNext(this._state)
    } catch (e) {
      if (streamError) {
        this.onError(e)
      }
      return Stop
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
      this._out.onError(e)
    }
  }
}

export default class ScanObservable<A, R> extends ObservableInstance<R> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _initial: () => R,
              private readonly _fn: (r: R, a: A) => R) {
    super()
  }

  unsafeSubscribeFn(out: Subscriber<R>): Cancelable {
    let streamErrors = true
    try {
      const initialState = this._initial()
      streamErrors = false

      return this._source.unsafeSubscribeFn(new ScanSubscriber(initialState, this._fn, out))
    } catch (e) {
      if (streamErrors) {
        out.onError(e)
      }

      return Cancelable.empty()
    }
  }
}
