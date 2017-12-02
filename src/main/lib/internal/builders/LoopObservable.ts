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
import { Continue, Stop, Subscriber, SyncAck } from "../../Reactive"
import { Future, Scheduler, IBoolCancelable, BoolCancelable, Cancelable } from "funfix"

export default class LoopObservable extends ObservableInstance<number> {
  constructor(private readonly _scheduler: Scheduler) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<number>): Cancelable {
    const cancelable = BoolCancelable.empty()

    this.loop(cancelable, subscriber, 0)

    return cancelable
  }

  private loop(cancelable: IBoolCancelable, downstream: Subscriber<number>, from: number): void {
    const ack = downstream.onNext(from)
    const nextFrom = from + 1

    if (ack === Continue) {
      this._scheduler.trampoline(() => {
        this.loop(cancelable, downstream, nextFrom)
      })
    } else if (ack === Stop) {
      // do nothing, done here
    } else {
      if (!cancelable.isCanceled()) {
        this.asyncBoundary(cancelable, ack, downstream, nextFrom)
      }
    }
  }

  private asyncBoundary(cancelable: IBoolCancelable, ack: Future<SyncAck>, downstream: Subscriber<number>, from: number): void {
    ack.onComplete((r) => {
      r.fold((e) => {
        downstream.onError(e)
      }, (a) => {
        if (a === Continue) {
          this.loop(cancelable, downstream, from)
        } else {
          // done, got Stop signal
        }
      })
    })
  }
}
