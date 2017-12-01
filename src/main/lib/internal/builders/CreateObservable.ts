import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable} from 'funfix';
import BackPressuredBufferedSubscriber from "../observers/buffers/BackPressuredBufferedSubscriber";

export default class CreateObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _fn: (s: Subscriber.Sync<A>) => Cancelable) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    const out = new BackPressuredBufferedSubscriber(4, subscriber);
    try {
      // FIXME implement Sync buffers
      // return this._fn(out);
      return Cancelable.empty();
    } catch (e) {
      subscriber.scheduler.reportFailure(e);
      return Cancelable.empty();
    }
  }
}