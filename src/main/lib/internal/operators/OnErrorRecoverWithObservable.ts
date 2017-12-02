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
import { Throwable, Cancelable, MultiAssignCancelable, Scheduler } from "funfix"
import { Ack, Continue, Subscriber } from "../../Reactive"

export default class OnErrorRecoverWithObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _fn: (e: Throwable) => ObservableInstance<A>) {
    super()
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const cancelable = MultiAssignCancelable.empty()

    const main = this._source.unsafeSubscribeFn(new OnErrorRecoverWithSubscriber(out, cancelable, this._fn))

    return cancelable.update(main)
  }
}

class OnErrorRecoverWithSubscriber<A> implements Subscriber<A> {
  private _ack: Ack = Continue

  constructor(private readonly _out: Subscriber<A>,
              private readonly _cancelable: MultiAssignCancelable,
              private readonly _fn: (e: Throwable) => ObservableInstance<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._ack = this._out.onNext(elem)
    return this._ack
  }

  onComplete(): void {
    this._out.onComplete()
  }

  onError(e: Throwable): void {
    let streamError = true
    try {
      const fallbackTo = this._fn(e)
      streamError = false

      this.scheduler.trampoline(() => {
        Ack.syncOnContinue(this._ack, () => {
          this._cancelable.update(fallbackTo.unsafeSubscribeFn(this._out))
        })
      })
    } catch (e) {
      if (streamError) {
        this._out.onError(e)
      } else {
        this.scheduler.reportFailure(e)
      }
    }
  }
}
