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
import { Ack, AsyncAck, Continue, Stop, Subscriber, SyncAck } from "../../../Reactive"
import { Throwable, Option, Scheduler } from "funfix"
import EvictingQueue from "../../collection/EvictingQueue"
import ArrayQueue from "../../collection/ArrayQueue"

function assert(expr: boolean, message: string): void {
  if (!expr) {
    throw new Error(message)
  }
}

export default class SyncBufferedSubscriber<A> implements Subscriber.Sync<A> {
  private _errorThrown: Throwable
  private _upstreamIsComplete: boolean = false
  private _downstreamIsComplete: boolean = false
  private _isLoopActive: boolean = false
  private _droppedCount: number = 0
  private _lastInteractionAck: Ack = Continue

  constructor(private readonly _out: Subscriber<A>,
              private readonly _queue: EvictingQueue<A>,
              private readonly _onOverflow?: (n: number) => Option<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): SyncAck {
    if (!this._upstreamIsComplete && !this._downstreamIsComplete) {
      try {
        this._droppedCount += this._queue.offer(elem)
        this.consume()
        return Continue
      } catch (e) {
        this.onError(e)
        return Stop
      }
    } else {
      return Stop
    }
  }

  onComplete(): void {
    if (!this._upstreamIsComplete && !this._downstreamIsComplete) {
      this._upstreamIsComplete = true
      this.consume()
    }
  }

  onError(e: Throwable): void {
    if (!this._upstreamIsComplete && !this._downstreamIsComplete) {
      this._errorThrown = e
      this._upstreamIsComplete = true
      this.consume()
    }
  }

  private consume(): void {
    if (!this._isLoopActive) {
      this._isLoopActive = true
      this.scheduler.trampoline(() => {
        this.fastLoop(this._lastInteractionAck)
      })
    }
  }

  private signalNext(next: A): Ack {
    try {
      const ack = this._out.onNext(next)

      if (ack === Continue || ack === Stop) {
        return ack
      } else {
        const value = ack.value()
        if (value.isEmpty()) {
          return ack
        } else {
          const r = value.get()
          if (r.isFailure()) {
            const e = r.failed().get()
            this.downstreamSignalComplete(e)
            return Stop
          } else {
            return r.get()
          }
        }
      }
    } catch (e) {
      this.downstreamSignalComplete(e)
      return Stop
    }
  }

  private downstreamSignalComplete(ex: Throwable | null = null): void {
    this._downstreamIsComplete = true
    try {
      if (ex !== null) {
        this._out.onError(ex)
      } else {
        this._out.onComplete()
      }
    } catch (e) {
      this.scheduler.reportFailure(e)
    }
  }

  private goAsync(next: A, ack: AsyncAck): void {
    ack.onComplete(r => {
      if (r.isSuccess()) {
        const nextAck = this.signalNext(next)
        this.fastLoop(nextAck)
      } else {
        this._isLoopActive = false
        this.downstreamSignalComplete(r.failed().get())
      }
    })
  }

  private fastLoop(prevAck: Ack): void {
    let ack = prevAck

    while (this._isLoopActive && !this._downstreamIsComplete) {
      let streamErrors = true
      try {
        let overflowMessage: A | null = null
        if (this._onOverflow && this._droppedCount > 0) {
          overflowMessage = this._onOverflow(this._droppedCount).orNull()
        }

        const next = overflowMessage !== null ? overflowMessage : this._queue.poll()
        streamErrors = false

        if (next !== undefined) {
          if (ack === Continue) {
            ack = this.signalNext(next)
            if (ack === Stop) {
              // ending loop
              this._downstreamIsComplete = true
              this._isLoopActive = false
              return
            }
            // continue loop
          } else if (ack === Stop) {
            // ending loop
            this._downstreamIsComplete = true
            this._isLoopActive = false
            return
          } else {
            this.goAsync(next, ack)
            return
          }
        } else {
          if (this._upstreamIsComplete) {
            this.downstreamSignalComplete(this._errorThrown)
          }
          // ending loop
          this._lastInteractionAck = ack
          this._isLoopActive = false
          return
        }
      } catch (e) {
        if (streamErrors) {
          this.downstreamSignalComplete(e)
          this._isLoopActive = false
          return
        } else {
          this.scheduler.reportFailure(e)
          return
        }
      }
    }
  }

  static unbounded<A>(underlying: Subscriber<A>): Subscriber.Sync<A> {
    const buffer = ArrayQueue.unbounded()
    return new SyncBufferedSubscriber(underlying, buffer)
  }

  static bounded<A>(underlying: Subscriber<A>, bufferSize: number): Subscriber.Sync<A> {
    const buffer = ArrayQueue.bounded(bufferSize, () => {
      return Error(
        `Downstream observer is too slow, buffer over capacity with a
        specified buffer size of ${bufferSize}`
      )
    })
    return new SyncBufferedSubscriber(underlying, buffer)
  }

  static dropNew<A>(underlying: Subscriber<A>, bufferSize: number): Subscriber.Sync<A> {
    assert(bufferSize > 1, "bufferSize must be strictly higher than 1")
    const buffer = ArrayQueue.bounded(bufferSize)
    return new SyncBufferedSubscriber(underlying, buffer)
  }

  static dropNewAndSignal<A>(underlying: Subscriber<A>, bufferSize: number, onOverflow: (n: number) => Option<A>): Subscriber.Sync<A> {
    assert(bufferSize > 1, "bufferSize must be strictly higher than 1")
    const buffer = ArrayQueue.bounded(bufferSize)
    return new SyncBufferedSubscriber(underlying, buffer, onOverflow)
  }

  // TODO implement more overflow strategies
}
