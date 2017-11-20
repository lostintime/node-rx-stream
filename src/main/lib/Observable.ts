import NowObservable from "./internal/builders/NowObservable";
import ObservableInstance from "./internal/ObservableInstance";
import RangeObservable from "./internal/builders/RangeObservable";
import {Scheduler} from 'funfix';
import LoopObservable from "./internal/builders/LoopObservable";
import OperatorsMixin from "./internal/mixins/OperatorsMixin";
import EmptyObservable from "./internal/builders/EmptyObservable";

applyMixins(ObservableInstance, [OperatorsMixin]);

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/Observable.scala
 */
export default abstract class Observable<T> extends ObservableInstance<T> {

  static empty<A>(): Observable<A> {
    return new EmptyObservable<A>();
  }

  static now<U>(value: U): Observable<U> {
    return new NowObservable(value)
  }

  static range(from: number, until: number, step: number = 1, scheduler?: Scheduler): Observable<number> {
    return new RangeObservable(from, until, step, scheduler || Scheduler.global.get());
  }

  static loop(scheduler?: Scheduler): Observable<number> {
    return new LoopObservable(scheduler || Scheduler.global.get());
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]) {
  baseCtors.forEach(baseCtor => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
      derivedCtor.prototype[name] = baseCtor.prototype[name];
    });
  });
}
