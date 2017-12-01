import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable} from 'funfix';

export default class EmptyObservable<A>  extends ObservableInstance<A> {
  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    subscriber.onComplete();

    return Cancelable.empty();
  }
}
