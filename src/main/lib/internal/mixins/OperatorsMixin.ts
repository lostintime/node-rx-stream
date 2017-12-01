import Observable from "../../Observable";
import {Ack, Operator, Subscriber} from "../../Reactive";
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
import {Scheduler, IO, Future, Cancelable, Throwable, Option, Some, None} from 'funfix';
import BufferSlidingSubscriber from "../operators/BufferSlidingSubscriber";
import MapIOObservable from "../operators/MapIOObservable";
import ScanObservable from "../operators/ScanObservable";
import ScanTaskObservable from "../operators/ScanTaskObservable";
import TakeUntilObservable from "../operators/TakeUntilObservable";
import FirstOrElseSubscriber from "../operators/FirstOrElseSubscriber";


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

  scanTask<S>(seed: () => IO<S>, op: (s: S, a: A) => IO<S>): Observable<S> {
    return new ScanTaskObservable(this, seed, op);
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

  takeUntil(trigger: Observable<any>): Observable<A> {
    return new TakeUntilObservable(this, trigger);
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

  first(): IO<A> {
    return this.firstOrElse(() => {
      throw new Error('first on empty observable');
    });
  }

  firstOrElse(fn: () => A): IO<A> {
    return IO.async((s, cb) => {
      this.unsafeSubscribeFn(new FirstOrElseSubscriber(cb, fn, s));
    })
  }

  firstOption(): IO<Option<A>> {
    return this.map((e) => Some(e)).firstOrElse(() => None);
  }

  liftByOperator<B>(operator: Operator<A, B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
