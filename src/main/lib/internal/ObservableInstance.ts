import {Cancelable, Operator, Subscriber} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";
import {MapOperatorMixin} from "../mixins";
import Observable from "../Observable";

/**
 * @deprecated move to Observable, use Mixins to avoid circular references
 */
export default abstract class ObservableInstance<A> implements MapOperatorMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  subscribe(subscriber: Subscriber<A>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<A>(subscriber))
  }

  map: <B>(source: Observable<A>, operator: Operator<A, B>) => Observable<B>;
}
