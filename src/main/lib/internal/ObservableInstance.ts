import {Cancelable, Subscriber} from "../Reactive";
import SafeSubscriber from "./builders/SafeSubscriber";

export default abstract class ObservableInstance<T> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<T>): Cancelable;

  subscribe(subscriber: Subscriber<T>): Cancelable {
    return this.unsafeSubscribeFn(new SafeSubscriber<T>(subscriber))
  }
}
