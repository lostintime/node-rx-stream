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
import { Subscriber } from "../../Reactive"
import { Cancelable, Throwable } from "funfix"

export default class EvalOnceObservable<A> extends ObservableInstance<A> {
  private _result: A
  private _errorThrown: Throwable | null = null
  private _hasResult: boolean = false

  constructor(private readonly _eval: () => A) {
    super()
  }

  private signalResult(out: Subscriber<A>, value: A, ex: Throwable | null): void {
    if (ex !== null) {
      try {
        out.onError(ex)
      } catch (e) {
        out.scheduler.reportFailure(e)
        out.scheduler.reportFailure(ex)
      }
    } else {
      try {
        out.onNext(value)
        out.onComplete()
      } catch (e) {
        out.scheduler.reportFailure(e)
      }
    }
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    if (!this._hasResult) {
      try {
        this._result = this._eval()
      } catch (e) {
        this._errorThrown = e
      }
      this._hasResult = true
    }

    this.signalResult(subscriber, this._result, this._errorThrown)

    return Cancelable.empty()
  }
}
