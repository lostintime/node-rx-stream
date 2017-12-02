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
import NowObservable from "./internal/builders/NowObservable"
import ObservableInstance from "./internal/ObservableInstance"
import RangeObservable from "./internal/builders/RangeObservable"
import { Scheduler, Cancelable, IO, Future, Eval } from "funfix"
import LoopObservable from "./internal/builders/LoopObservable"
import OperatorsMixin from "./internal/mixins/OperatorsMixin"
import EmptyObservable from "./internal/builders/EmptyObservable"
import ArrayObservable from "./internal/builders/ArrayObservable"
import NeverObservable from "./internal/builders/NeverObservable"
import EvalAlwaysObservable from "./internal/builders/EvalAlwaysObservable"
import RepeatEvalObservable from "./internal/builders/RepeatEvalObservable"
import EvalOnceObservable from "./internal/builders/EvalOnceObservable"
import { Subscriber } from "./Reactive"
import CreateObservable from "./internal/builders/CreateObservable"
import TaskAsObservable from "./internal/builders/TaskAsObservable"

applyMixins(ObservableInstance, [OperatorsMixin])

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/Observable.scala
 */
export abstract class Observable<T> extends ObservableInstance<T> {

  static empty<A>(): Observable<A> {
    return new EmptyObservable<A>()
  }

  static pure<A>(value: A): Observable<A> {
    return new NowObservable(value)
  }

  static now<A>(value: A): Observable<A> {
    return new NowObservable(value)
  }

  static range(from: number, until: number, step: number = 1, scheduler?: Scheduler): Observable<number> {
    return new RangeObservable(from, until, step, scheduler || Scheduler.global.get())
  }

  static loop(scheduler?: Scheduler): Observable<number> {
    return new LoopObservable(scheduler || Scheduler.global.get())
  }

  static items<A>(...items: Array<A>): Observable<A> {
    return new ArrayObservable(items, Scheduler.global.get())
  }

  static fromArray<A>(arr: Array<A>, scheduler?: Scheduler): Observable<A> {
    return new ArrayObservable(arr, scheduler || Scheduler.global.get())
  }

  static never<A>(): Observable<A> {
    return NeverObservable
  }

  static eval<A>(fn: () => A): Observable<A> {
    return new EvalAlwaysObservable(fn)
  }

  static evalOnce<A>(fn: () => A): Observable<A> {
    return new EvalOnceObservable(fn)
  }

  static repeatEval<A>(fn: () => A): Observable<A> {
    return new RepeatEvalObservable(fn)
  }

  static create<A>(fn: (s: Subscriber.Sync<A>) => Cancelable): Observable<A> {
    return new CreateObservable(fn)
  }

  static fromTask<A>(task: IO<A>): Observable<A> {
    return new TaskAsObservable(task)
  }

  static fromFuture<A>(factory: () => Future<A>): Observable<A> {
    return Observable.fromTask(IO.deferFuture(factory))
  }

  static fromEval<A>(value: Eval<A>): Observable<A> {
    return Observable.eval(() => value.get())
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name]
    })
  })
}

export default Observable
