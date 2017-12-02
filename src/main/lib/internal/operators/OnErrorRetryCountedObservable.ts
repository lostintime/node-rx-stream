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
import { Throwable, Scheduler, MultiAssignCancelable, Cancelable } from "funfix"
import ObservableInstance from "../ObservableInstance"

export default class OnErrorRetryCountedObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _source,
              private readonly _maxRetries: number) {
    super()
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const task = MultiAssignCancelable.empty()
    this.loop(out, task, 0)

    return task
  }

  loop(out: Subscriber<A>, task: MultiAssignCancelable, retryIdx: number): void {
    const cancelable = this._source.unsafeSubscribeFn(new OnErrorRetryCountedSubscriber(this, out, task, this._maxRetries, retryIdx))
    task.update(cancelable)
  }
}

class OnErrorRetryCountedSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false
  private _ack: Ack = Continue

  constructor(private readonly _parent: OnErrorRetryCountedObservable<A>,
              private readonly _out: Subscriber<A>,
              private readonly _task: MultiAssignCancelable,
              private readonly _maxRetries: number,
              private readonly _retryIdx: number,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._ack = this._out.onNext(elem)
    return this._ack
  }

  onComplete(): void {
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true

      if (this._maxRetries < 0 || this._retryIdx < this._maxRetries) {
        this.scheduler.trampoline(() => {
          Ack.syncOnContinue(this._ack, () => {
            this._parent.loop(this._out, this._task, this._retryIdx + 1)
          })
        })
      } else {
        this._out.onError(e)
      }
    }
  }
}
