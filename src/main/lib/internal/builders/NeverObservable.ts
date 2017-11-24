import ObservableInstance from "../ObservableInstance";
import {Cancelable, Subscriber} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";

class NeverObservableImpl extends ObservableInstance<never> {
  unsafeSubscribeFn(subscriber: Subscriber<never>): Cancelable {
    return new EmptyCancelable();
  }
}

const NeverObservable: ObservableInstance<never> = new NeverObservableImpl();

export default NeverObservable;
