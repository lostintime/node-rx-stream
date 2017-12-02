import {Ack, Operator, Subscriber} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";
import OperatorsMixin from "./mixins/OperatorsMixin";
import {Scheduler, IO, Future, Cancelable, Throwable, Option} from "funfix";
import SubscriberWrap from "./observers/SubscriberWrap";


export default abstract class ObservableInstance<A> implements OperatorsMixin<A> {
  abstract unsafeSubscribeFn(out: Subscriber<A>): Cancelable;

  subscribeWith(out: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(out))
  }

  subscribe(nextFn?: (elem: A) => Ack,
            errorFn?: (e: Throwable) => void,
            completeFn?: () => void,
            scheduler?: Scheduler): Cancelable {
    return this.subscribeWith(new SubscriberWrap(nextFn, errorFn, completeFn, scheduler));
  }

  liftByOperator: <B>(operator: Operator<A, B>) => ObservableInstance<B>;

  map: <B>(fn: (a: A) => B) => ObservableInstance<B>;

  mapTask: <B>(fn: (a: A) => IO<B>) => ObservableInstance<B>;

  mapFuture: <B>(fn: (a: A) => Future<B>) => ObservableInstance<B>;

  flatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  flatMapDelayErrors: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  concatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  concatMapDelayErrors: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  scan: <S>(seed: () => S, op: (s: S, a: A) => S) => ObservableInstance<S>;

  scanTask: <S>(seed: () => IO<S>, op: (s: S, a: A) => IO<S>) => ObservableInstance<S>;

  filter: (fn: (a: A) => boolean) => ObservableInstance<A>;

  take: (n: number) => ObservableInstance<A>;

  drop: (n: number) => ObservableInstance<A>;

  takeLast: (n: number) => ObservableInstance<A>;

  last: () => ObservableInstance<A>;

  takeWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  dropWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  takeUntil: (trigger: ObservableInstance<any>) => ObservableInstance<A>;

  failed: () => ObservableInstance<Throwable>;

  bufferWithPressure: (size: number) => ObservableInstance<A>;

  bufferTumbling: (count: number) => ObservableInstance<A[]>;

  bufferSliding: (count: number, skip: number) => ObservableInstance<A[]>;

  headL: () => IO<A>;

  firstL: () => IO<A>;

  firstOrElseL: (fn: () => A) => IO<A>;

  firstOrElseF: (fn: () => A) => ObservableInstance<A>;

  headOrElseF: (fn: () => A) => ObservableInstance<A>;

  firstOptionL: () => IO<Option<A>>;

  headF: () => ObservableInstance<A>;

  findL: (p: (a: A) => boolean) => IO<Option<A>>;

  findF: (p: (a: A) => boolean) => ObservableInstance<A>;

  existsL: (p: (a: A) => boolean) => IO<boolean>;

  forAll: (p: (a: A) => boolean) => IO<boolean>;

  lastOrElseL: (fn: () => A) => IO<A>;

  lastOptionL: () => IO<Option<A>>;

  lastL: () => IO<A>;

  isEmptyL: () => IO<boolean>;

  isEmptyF: () => ObservableInstance<boolean>;

  countL: () => IO<number>;

  countF: () => ObservableInstance<number>;

  foldLeftF: <R>(seed: () => R, op: (r: R, a: A) => R) => ObservableInstance<R>;

  foldLeftL: <R>(seed: () => R, op: (r: R, a: A) => R) => IO<R>;

  defaultIfEmpty: (f: () => A) => ObservableInstance<A>;

  takeEveryNth: (n: number) => ObservableInstance<A>;

  onErrorHandleWith: (f: (e: Throwable) => ObservableInstance<A>) => ObservableInstance<A>;

  onErrorHandle: (f: (e: Throwable) => A) => ObservableInstance<A>;

  onErrorFallbackTo: (that: ObservableInstance<A>) => ObservableInstance<A>;

  onErrorRestart: (maxRetries: number) => ObservableInstance<A>;

  onErrorRestartUnlimited: () => ObservableInstance<A>;

  onErrorRestartIf: (p: (e: Throwable) => boolean) => ObservableInstance<A>;
}
