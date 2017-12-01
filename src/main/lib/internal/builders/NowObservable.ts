import {Subscriber} from "../../Reactive";
import ObservableInstance from "../ObservableInstance";
import {Cancelable} from "funfix";

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/internal/builders/NowObservable.scala
 */
export default class NowObservable<T> extends ObservableInstance<T> {
  constructor(private readonly _value: T) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<T>): Cancelable {
    // No need to back-pressure for onComplete
    subscriber.onNext(this._value);
    subscriber.onComplete();

    return Cancelable.empty();
  }
}
