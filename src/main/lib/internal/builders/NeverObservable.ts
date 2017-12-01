import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable} from "funfix";

class NeverObservableImpl extends ObservableInstance<any> {
  unsafeSubscribeFn(subscriber: Subscriber<any>): Cancelable {
    return Cancelable.empty();
  }
}

const NeverObservable: ObservableInstance<any> = new NeverObservableImpl();

export default NeverObservable;
