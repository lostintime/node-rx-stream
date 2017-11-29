import Observable from "../../Observable";
import {Cancelable, Operator, Subscriber} from "../../Reactive";
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable";
import MapSubscriber from "../operators/MapSubscriber";
import FilterSubscriber from "../operators/FilterSubscriber";
import ConcatMapObservable from "../operators/ConcatMapObservable";
import DropFirstSubscriber from "../operators/DropFirstSubscriber";


export default abstract class OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  abstract subscribe(subscriber: Subscriber<A>): Cancelable;

  map<B>(fn: (a: A) => B): Observable<B> {
    return this.liftByOperator((out: Subscriber<B>) => new MapSubscriber(fn, out))
  }

  flatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return this.concatMap(fn);
  }

  concatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return new ConcatMapObservable(this, fn, false);
  }

  filter(fn: (a: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new FilterSubscriber(fn, out));
  }

  drop(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropFirstSubscriber(n, out))
  }

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
