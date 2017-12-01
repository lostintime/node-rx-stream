import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable} from "funfix";

class NeverObservableImpl extends ObservableInstance<never> {
  unsafeSubscribeFn(subscriber: Subscriber<never>): Cancelable {
    return Cancelable.empty();
  }
}

const NeverObservable: ObservableInstance<never> = new NeverObservableImpl();

export default NeverObservable;
