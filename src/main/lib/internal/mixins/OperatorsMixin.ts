import Observable from "../../Observable";
import {Cancelable, Operator, Subscriber} from "../../Reactive";
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable";
import MapSubscriber from "../operators/MapSubscriber";
import FilterSubscriber from "../operators/FilterSubscriber";
import ConcatMapObservable from "../operators/ConcatMapObservable";
import DropFirstSubscriber from "../operators/DropFirstSubscriber";
import {TakePositiveSubscriber, TakeZeroSubscriber} from "../operators/TakeLeftSubscriber";
import TakeByPredicateSubscriber from "../operators/TakeByPredicateSubscriber";
import DropByPredicateSubscriber from "../operators/DropByPredicateSubscriber";


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

  take(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => {
      if (n <= 0) {
        return new TakeZeroSubscriber(out)
      } else {
        return new TakePositiveSubscriber(n, out);
      }
    })
  }

  drop(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropFirstSubscriber(n, out))
  }

  takeWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeByPredicateSubscriber(p, out));
  }

  dropWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropByPredicateSubscriber(p, out));
  }

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
