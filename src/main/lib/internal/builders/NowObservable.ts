import {Cancelable, Subscriber} from "../../Reactive";
import ObservableInstance from "../ObservableInstance";
import EmptyCancelable from "../cancelables/EmptyCancelable";

/**
 * https://github.com/monix/monix/blob/master/monix-reactive/shared/src/main/scala/monix/reactive/internal/builders/NowObservable.scala
 */
export default class NowObservable<T> extends ObservableInstance<T> {
  private _isCancelled: boolean = false;
  private _value: T;

  constructor(value: T) {
    super();
    this._value = value;
  }

  unsafeSubscribeFn(subscriber: Subscriber<T>): Cancelable {
    // No need to back-pressure for onComplete
    subscriber.onNext(this._value);
    subscriber.onComplete();

    return new EmptyCancelable();
  }
}
