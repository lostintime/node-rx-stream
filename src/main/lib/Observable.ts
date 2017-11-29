import NowObservable from "./internal/builders/NowObservable";
import ObservableInstance from "./internal/ObservableInstance";
import RangeObservable from "./internal/builders/RangeObservable";
import {Scheduler} from 'funfix';
import LoopObservable from "./internal/builders/LoopObservable";
import OperatorsMixin from "./internal/mixins/OperatorsMixin";
import EmptyObservable from "./internal/builders/EmptyObservable";
import ArrayObservable from "./internal/builders/ArrayObservable";
import NeverObservable from "./internal/builders/NeverObservable";
import EvalAlwaysObservable from "./internal/builders/EvalAlwaysObservable";
import RepeatEvalObservable from "./internal/builders/RepeatEvalObservable";

applyMixins(ObservableInstance, [OperatorsMixin]);

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/Observable.scala
 */
export default abstract class Observable<T> extends ObservableInstance<T> {

  static empty<A>(): Observable<A> {
    return new EmptyObservable<A>();
  }

  static pure<A>(value: A): Observable<A> {
    return new NowObservable(value);
  }

  static now<A>(value: A): Observable<A> {
    return new NowObservable(value)
  }

  static range(from: number, until: number, step: number = 1, scheduler?: Scheduler): Observable<number> {
    return new RangeObservable(from, until, step, scheduler || Scheduler.global.get());
  }

  static loop(scheduler?: Scheduler): Observable<number> {
    return new LoopObservable(scheduler || Scheduler.global.get());
  }

  static items<A>(...items: Array<A>): Observable<A> {
    return new ArrayObservable(items, Scheduler.global.get());
  }

  static fromArray<A>(arr: Array<A>, scheduler?: Scheduler): Observable<A> {
    return new ArrayObservable(arr, scheduler || Scheduler.global.get());
  }

  static never<A>(): Observable<A> {
    return NeverObservable;
  }

  static eval<A>(fn: () => A): Observable<A> {
    return new EvalAlwaysObservable(fn);
  }

  static repeatEval<A>(task: () => A): Observable<A> {
    return new RepeatEvalObservable(task);
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
