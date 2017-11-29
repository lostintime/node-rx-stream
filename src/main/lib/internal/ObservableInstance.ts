import {Cancelable, Operator, Subscriber, Throwable} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";
import OperatorsMixin from "./mixins/OperatorsMixin";

export default abstract class ObservableInstance<A> implements OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  subscribe(subscriber: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(subscriber))
  }

  map: <B>(fn: (a: A) => B) => ObservableInstance<B>;

  flatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  concatMap: <B>(fn: (a: A) => ObservableInstance<B>) => ObservableInstance<B>;

  filter: (fn: (a: A) => boolean) => ObservableInstance<A>;

  take: (n: number) => ObservableInstance<A>;

  drop: (n: number) => ObservableInstance<A>;

  takeWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  dropWhile: (p: (elem: A) => boolean) => ObservableInstance<A>;

  failed: () => ObservableInstance<Throwable>;

  liftByOperator: <B>(operator: Operator<A, B>) => ObservableInstance<B>;
}
