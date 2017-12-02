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
import { Ack, AsyncAck, Continue, Stop, Subscriber } from "../../Reactive"
import { Scheduler, Future, Cancelable, IBoolCancelable, BoolCancelable } from "funfix"

export default class RepeatEvalObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _eval: () => A) {
    super()
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    const s = subscriber.scheduler
    const cancelable = BoolCancelable.empty()
    this.fastLoop(subscriber, cancelable, s)
    return cancelable
  }

  private reschedule(ack: AsyncAck, o: Subscriber<A>, c: IBoolCancelable, s: Scheduler) {
    ack.onComplete(r => {
      r.fold((e) => {
        s.reportFailure(e)
      }, a => {
        if (a === Continue) {
          this.fastLoop(o, c, s)
        }
      })
    })
  }

  private fastLoop(o: Subscriber<A>, c: IBoolCancelable, s: Scheduler): void {
    let ack: Ack
    try {
      ack = o.onNext(this._eval())
    } catch (e) {
      ack = Future.raise(e)
    }

    if (ack === Continue) {
      // tailrec call here
      s.trampoline(() => {
        this.fastLoop(o, c, s)
      })
    } else if (ack !== Stop && !c.isCanceled()) {
      this.reschedule(ack, o, c, s)
    }
  }
}
