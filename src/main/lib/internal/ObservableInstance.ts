import {Cancelable, Operator, Subscriber} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";
import OperatorsMixin from "./mixins/OperatorsMixin";

export default abstract class ObservableInstance<A> implements OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  subscribe(subscriber: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(subscriber))
  }

  map: <B>(fn: (a: A) => B) => ObservableInstance<B>;

  liftByOperator: <B>(operator: Operator<A, B>) => ObservableInstance<B>;
}
