import NowObservable from "./internal/builders/NowObservable";
import ObservableInstance from "./internal/ObservableInstance";
import RangeObservable from "./internal/builders/RangeObservable";
import {Scheduler} from 'funfix';
import LoopObservable from "./internal/builders/LoopObservable";
import {Operator} from "./Reactive";
import LiftByOperatorObservable from "./internal/operators/LiftByOperatorObservable";
import apply = Reflect.apply;

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/Observable.scala
 */
export default abstract class Observable<T> extends ObservableInstance<T> {
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
