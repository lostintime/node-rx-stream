import {Ack, Cancelable, Operator, Subscriber, Throwable} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";
import OperatorsMixin from "./mixins/OperatorsMixin";
import {Scheduler} from "funfix";
import SubscriberWrap from "./observers/SubscriberWrap";


export default abstract class ObservableInstance<A> implements OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  subscribeWith(subscriber: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(subscriber))
  }

  subscribe(nextFn?: (elem: A) => Ack,
            errorFn?: (e: Throwable) => void,
            completeFn?: () => void,
            scheduler?: Scheduler): Cancelable {
    return this.subscribeWith(new SubscriberWrap(nextFn, errorFn, completeFn, scheduler));
  }

  map: <B>(fn: (a: A) => B) => ObservableInstance<B>;

  flatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  flatMapDelayErrors: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  concatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  concatMapDelayErrors: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  filter: (fn: (a: A) => boolean) => ObservableInstance<A>;

  take: (n: number) => ObservableInstance<A>;

  drop: (n: number) => ObservableInstance<A>;

  takeLast: (n: number) => ObservableInstance<A>;

  last: () => ObservableInstance<A>;

  takeWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  dropWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  failed: () => ObservableInstance<Throwable>;

  bufferWithPressure: (size: number) => ObservableInstance<A>;

  bufferTumbling: (count: number) => ObservableInstance<A[]>;

  bufferSliding: (count: number, skip: number) => ObservableInstance<A[]>;

  liftByOperator: <B>(operator: Operator<A, B>) => ObservableInstance<B>;
}
