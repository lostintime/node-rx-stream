import ObservableInstance from "../ObservableInstance";
import {Cancelable, Subscriber} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";

export default class EmptyObservable<A>  extends ObservableInstance<A> {
  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    subscriber.onComplete();

    return EmptyCancelable;
  }
}
