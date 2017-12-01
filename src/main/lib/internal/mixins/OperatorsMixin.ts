import Observable from "../../Observable";
import {Ack, Operator, Subscriber, Throwable} from "../../Reactive";
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable";
import MapSubscriber from "../operators/MapSubscriber";
import FilterSubscriber from "../operators/FilterSubscriber";
import ConcatMapObservable from "../operators/ConcatMapObservable";
import DropFirstSubscriber from "../operators/DropFirstSubscriber";
import {TakePositiveSubscriber, TakeZeroSubscriber} from "../operators/TakeLeftSubscriber";
import TakeByPredicateSubscriber from "../operators/TakeByPredicateSubscriber";
import DropByPredicateSubscriber from "../operators/DropByPredicateSubscriber";
import FailedSubscriber from "../operators/FailedSubscriber";
import TakeLastSubscriber from "../operators/TakeLastSubscriber";
import BackPressuredBufferedSubscriber from "../observers/buffers/BackPressuredBufferedSubscriber";
import {Scheduler, IO, Future, Cancelable} from 'funfix';
import BufferSlidingSubscriber from "../operators/BufferSlidingSubscriber";
import MapIOObservable from "../operators/MapIOObservable";
import ScanObservable from "../operators/ScanObservable";


export default abstract class OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  abstract subscribeWith(subscriber: Subscriber<A>): Cancelable;

  abstract subscribe(nextFn?: (elem: A) => Ack,
                     errorFn?: (e: Throwable) => void,
                     completeFn?: () => void,
                     scheduler?: Scheduler): Cancelable;

  map<B>(fn: (a: A) => B): Observable<B> {
    return this.liftByOperator((out: Subscriber<B>) => new MapSubscriber(fn, out))
  }

  mapIO<B>(fn: (a: A) => IO<B>): Observable<B> {
    return new MapIOObservable(this, fn);
  }

  mapFuture<B>(fn: (a: A) => Future<B>): Observable<B> {
    return new MapIOObservable(this, (elem: A) => {
      try {
        return IO.fromFuture(fn(elem))
      } catch (e) {
        return IO.raise(e);
      }
    });
  }

  flatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return this.concatMap(fn);
  }

  flatMapDelayErrors<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return this.concatMapDelayErrors(fn);
  }

  concatMap<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return new ConcatMapObservable(this, fn, false);
  }

  concatMapDelayErrors<B>(fn: (a: A) => Observable<B>): Observable<B> {
    return new ConcatMapObservable(this, fn, true);
  }

  scan<S>(seed: () => S, op: (s: S, a: A) => S): Observable<S> {
    return new ScanObservable(this, seed, op);
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
    });
  }

  drop(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropFirstSubscriber(n, out));
  }

  takeLast(n: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeLastSubscriber(n, out));
  }

  last(): Observable<A> {
    return this.takeLast(1);
  }

  takeWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new TakeByPredicateSubscriber(p, out));
  }

  dropWhile(p: (elem: A) => boolean): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new DropByPredicateSubscriber(p, out));
  }

  failed(): Observable<Throwable> {
    return this.liftByOperator((out: Subscriber<Throwable>) => new FailedSubscriber(out));
  }

  bufferWithPressure(size: number): Observable<A> {
    return this.liftByOperator((out: Subscriber<A>) => new BackPressuredBufferedSubscriber(size, out))
  }

  bufferTumbling(count: number): Observable<A[]> {
    return this.bufferSliding(count, count);
  }

  bufferSliding(count: number, skip: number): Observable<A[]> {
    return this.liftByOperator((out: Subscriber<A[]>) => new BufferSlidingSubscriber(count, skip, out))
  }

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
