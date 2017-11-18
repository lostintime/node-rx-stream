import Observable from "../Observable";
import {Operator} from "../Reactive";
import NowObservable from "../internal/builders/NowObservable";
import RangeObservable from "../internal/builders/RangeObservable";
import LoopObservable from "../internal/builders/LoopObservable";
import {Scheduler} from 'funfix';

export class MapOperatorMixin<A> {
  map<B>(source: Observable<A>, operator: Operator<A, B>): Observable<B> {
    return null as any;
  }
}

export class ObservableBuildersMixin<A> {
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