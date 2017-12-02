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
import { Scheduler, Throwable } from "funfix"

/**
 * This is an optimization for TakePositiveSubscriber
 */
export class TakeZeroSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false

  constructor(private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this.onComplete()
    return Stop
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

/**
 * Issue first n elements to child subscriber
 */
export class TakePositiveSubscriber<A> implements Subscriber<A> {
  private _counter: number = 0
  private _isActive: boolean = true

  constructor(private readonly _n: number,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isActive && this._counter < this._n) {
      this._counter += 1

      if (this._counter < this._n) {
        return this._out.onNext(elem)
      } else {
        this._isActive = false
        this._out.onNext(elem)
        this._out.onComplete()
        return Stop
      }
    } else {
      return Stop
    }
  }

  onComplete(): void {
    if (this._isActive) {
      this._isActive = false
      this._out.onComplete()
    }
  }

  onError(e: Throwable): void {
    if (this._isActive) {
      this._isActive = false
      this._out.onError(e)
    }
  }
}
