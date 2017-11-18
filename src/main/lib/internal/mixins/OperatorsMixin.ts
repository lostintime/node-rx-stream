import Observable from "../../Observable";
import {Cancelable, Operator, Subscriber} from "../../Reactive";
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable";
import MapOperator from "../operators/MapOperator";
import FilterOperator from "../operators/FilterOperator";


export default abstract class OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  abstract subscribe(subscriber: Subscriber<A>): Cancelable;

  map<B>(fn: (a: A) => B): Observable<B> {
    return this.liftByOperator((out: Subscriber<B>) => new MapOperator(fn, out))
  }

  filter(fn: (a: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new FilterOperator(fn, out));
  }

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
