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
import { Cancelable } from "funfix"

export default class EvalAlwaysObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _fn: () => A) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    try {
      subscriber.onNext(this._fn())
      // No need to do back-pressure
      subscriber.onComplete()
    } catch (e) {
      try {
        subscriber.onError(e)
      } catch (e2) {
        const scheduler = subscriber.scheduler
        scheduler.reportFailure(e)
        scheduler.reportFailure(e2)
      }
    }

    return Cancelable.empty()
  }
}
