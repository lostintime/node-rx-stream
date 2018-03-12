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
import Observable from "../../Observable"
import { Ack, Operator, Subscriber } from "../../Reactive"
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable"
import MapSubscriber from "../operators/MapSubscriber"
import FilterSubscriber from "../operators/FilterSubscriber"
import ConcatMapObservable from "../operators/ConcatMapObservable"
import DropFirstSubscriber from "../operators/DropFirstSubscriber"
import { TakePositiveSubscriber, TakeZeroSubscriber } from "../operators/TakeLeftSubscriber"
import TakeByPredicateSubscriber from "../operators/TakeByPredicateSubscriber"
import DropByPredicateSubscriber from "../operators/DropByPredicateSubscriber"
import FailedSubscriber from "../operators/FailedSubscriber"
import TakeLastSubscriber from "../operators/TakeLastSubscriber"
import BackPressuredBufferedSubscriber from "../observers/buffers/BackPressuredBufferedSubscriber"
import { Scheduler, IO, Future, Cancelable, Throwable, Option, Some, None, FutureMaker, Success, Failure } from "funfix"
import BufferSlidingSubscriber from "../operators/BufferSlidingSubscriber"
import MapIOObservable from "../operators/MapIOObservable"
import ScanObservable from "../operators/ScanObservable"
import ScanTaskObservable from "../operators/ScanTaskObservable"
import TakeUntilObservable from "../operators/TakeUntilObservable"
import FirstOrElseSubscriber from "../operators/FirstOrElseSubscriber"
import LastOrElseSubscriber from "../operators/LastOrElseSubscriber"
import FoldLeftObservable from "../operators/FoldLeftObservable"
import ObservableInstance from "../ObservableInstance"
import OnErrorRecoverWithObservable from "../operators/OnErrorRecoverWithObservable"
import OnErrorRetryCountedObservable from "../operators/OnErrorRetryCountedObservable"
import OnErrorRetryIfObservable from "../operators/OnErrorRetryIfObservable"
import CountSubscriber from "../operators/CountSubscriber"
import DefaultIfEmptySubscriber from "../operators/DefaultIfEmptySubscriber"
import TakeEveryNthSubscriber from "../operators/TakeEveryNthSubscriber"
import IsEmptySubscriber from "../operators/IsEmptySubscriber"
import ForeachSubscriber from "../subscribers/ForeachSubscriber"

export default abstract class OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable

  abstract subscribeWith(subscriber: Subscriber<A>): Cancelable

  abstract subscribe(nextFn?: (elem: A) => Ack,
                     errorFn?: (e: Throwable) => void,
                     completeFn?: () => void,
                     scheduler?: Scheduler): Cancelable

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator)
  }

  map<B>(fn: (a: A) => B): Observable<B> {
    return this.liftByOperator((out: Subscriber<B>) => new MapSubscriber(fn, out))
  }

  mapTask<B>(fn: (a: A) => IO<B>): Observable<B> {
    return new MapIOObservable(this, fn)
  }

  mapFuture<B>(fn: (a: A) => Future<B>): Observable<B> {
    return new MapIOObservable(this, (elem: A) => {
      try {
        return IO.fromFuture(fn(elem))
      } catch (e) {
        return IO.raise(e)
      }
    })
  }

  flatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return this.concatMap(fn)
  }

  flatMapDelayErrors<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return this.concatMapDelayErrors(fn)
  }

  concatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return new ConcatMapObservable(this, fn, false)
  }

  concatMapDelayErrors<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return new ConcatMapObservable(this, fn, true)
  }

  scan<S>(seed: () => S, op: (s: S, a: A) => S): Observable<S> {
    return new ScanObservable(this, seed, op)
  }

  scanTask<S>(seed: () => IO<S>, op: (s: S, a: A) => IO<S>): Observable<S> {
    return new ScanTaskObservable(this, seed, op)
  }

  filter(fn: (a: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new FilterSubscriber(fn, out))
  }

  take(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => {
      if (n <= 0) {
        return new TakeZeroSubscriber(out)
      } else {
        return new TakePositiveSubscriber(n, out)
      }
    })
  }

  drop(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropFirstSubscriber(n, out))
  }

  takeLast(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeLastSubscriber(n, out))
  }

  last(): Observable<A> {
    return this.takeLast(1)
  }

  takeWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeByPredicateSubscriber(p, out))
  }

  dropWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropByPredicateSubscriber(p, out))
  }

  takeUntil(trigger: Observable<any>): Observable<A> {
    return new TakeUntilObservable(this, trigger)
  }

  failed(): Observable<Throwable> {
    return this.liftByOperator((out: Subscriber<Throwable>) => new FailedSubscriber(out))
  }

  bufferWithPressure(size: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new BackPressuredBufferedSubscriber(size, out))
  }

  bufferTumbling(count: number): Observable<A[]> {
    return this.bufferSliding(count, count)
  }

  bufferSliding(count: number, skip: number): Observable<A[]> {
    return this.liftByOperator((out: Subscriber<A[]>) => new BufferSlidingSubscriber(count, skip, out))
  }

  headF(): Observable<A> {
    return this.take(1)
  }

  headL(): IO<A> {
    return this.firstL()
  }

  firstL(): IO<A> {
    return this.firstOrElseL(() => {
      throw new Error("first on empty observable")
    })
  }

  firstOrElseF(fn: () => A): Observable<A> {
    return this.headOrElseF(fn)
  }

  headOrElseF(fn: () => A): Observable<A> {
    return this.headF()
      .foldLeftF(() => Option.empty<A>(), (_, elem) => Some(elem))
      .map(elemOpt => elemOpt.getOrElseL(fn))
  }

  firstOrElseL(fn: () => A): IO<A> {
    return IO.async((s, cb) => {
      this.unsafeSubscribeFn(new FirstOrElseSubscriber(cb, fn, s))
    })
  }

  headOptionL(): IO<Option<A>> {
    return this.firstOptionL()
  }

  firstOptionL(): IO<Option<A>> {
    return this.map((e): Option<A> => Some(e)).firstOrElseL(() => None)
  }

  findL(p: (a: A) => boolean): IO<Option<A>> {
    return this.filter(p).firstOptionL()
  }

  findF(p: (a: A) => boolean): ObservableInstance<A> {
    return this.filter(p).headF()
  }

  existsL(p: (a: A) => boolean): IO<boolean> {
    return this.findL(p).map(o => o.nonEmpty())
  }

  forAll(p: (a: A) => boolean): IO<boolean> {
    return this.existsL(e => !p(e)).map(r => !r)
  }

  lastOrElseL(fn: () => A): IO<A> {
    return IO.async((s, cb) => {
      this.unsafeSubscribeFn(new LastOrElseSubscriber(cb, fn, s))
    })
  }

  lastOptionL(): IO<Option<A>> {
    return this.map((e): Option<A> => Some(e)).lastOrElseL(() => None)
  }

  lastL(): IO<A> {
    return this.lastOrElseL(() => {
      throw new Error("last on empty observable")
    })
  }

  isEmptyL(): IO<boolean> {
    return this.isEmptyF().headL()
  }

  isEmptyF(): ObservableInstance<boolean> {
    return this.liftByOperator((out: Subscriber<boolean>) => new IsEmptySubscriber(out))
  }

  countL(): IO<number> {
    return this.countF().firstL()
  }

  countF(): ObservableInstance<number> {
    return this.liftByOperator((out: Subscriber<number>) => new CountSubscriber(out))
  }

  foldLeftF<R>(seed: () => R, op: (r: R, a: A) => R): Observable<R> {
    return new FoldLeftObservable(this, seed, op)
  }

  foldLeftL<R>(seed: () => R, op: (r: R, a: A) => R): IO<R> {
    return this.foldLeftF(seed, op).firstL()
  }

  defaultIfEmpty(f: () => A): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DefaultIfEmptySubscriber(out, f))
  }

  takeEveryNth(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeEveryNthSubscriber(out, n))
  }

  onErrorHandleWith(f: (e: Throwable) => Observable<A>): Observable<A> {
    return new OnErrorRecoverWithObservable(this, f)
  }

  onErrorHandle(f: (e: Throwable) => A): Observable<A> {
    return this.onErrorHandleWith((e) => Observable.now(f(e)))
  }

  onErrorFallbackTo(that: Observable<A>): Observable<A> {
    return this.onErrorHandleWith(() => that)
  }

  onErrorRestart(maxRetries: number): Observable<A> {
    if (maxRetries <= 0) {
      throw new Error("maxRetries should be positive")
    }

    return new OnErrorRetryCountedObservable(this, maxRetries)
  }

  onErrorRestartUnlimited(): Observable<A> {
    return new OnErrorRetryCountedObservable(this, -1)
  }

  onErrorRestartIf(p: (e: Throwable) => boolean): Observable<A> {
    return new OnErrorRetryIfObservable(this, p)
  }

  foreachL(onNext: (a: A) => void): IO<any> {
    return IO.deferFutureAction((s) => this.foreach(onNext, s))
  }

  foreach(onNext: (a: A) => void, scheduler?: Scheduler): Future<any> {
    const m = FutureMaker.empty<any>()

    const onSuccess = () => {
      m.success(null)
    }

    const onFailure = (e: Throwable) => {
      m.failure(e)
    }

    const c = this.unsafeSubscribeFn(new ForeachSubscriber(onNext, onSuccess, onFailure, scheduler || Scheduler.global.get()))

    return m.future(c)
  }
}
