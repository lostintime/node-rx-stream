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
import { Ack, Continue, Stop, Subscriber } from "../../Reactive"
import { Cancelable, Throwable, Scheduler } from "funfix"

export default class FoldLeftObservable<A, R> extends ObservableInstance<R> {

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

      return this._source.unsafeSubscribeFn(new FoldLeftSubscriber(initialState, out, this._fn))
    } catch (e) {
      if (streamErrors) {
        out.onError(e)
      }

      return Cancelable.empty()
    }
  }
}

class FoldLeftSubscriber<A, R> implements Subscriber<A> {
  private _isDone = false

  constructor(private state: R,
              private readonly _out: Subscriber<R>,
              private readonly _fn: (r: R, a: A) => R,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    try {
      this.state = this._fn(this.state, elem)
      return Continue
    } catch (e) {
      this.onError(e)
      return Stop
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true
      this._out.onNext(this.state)
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
