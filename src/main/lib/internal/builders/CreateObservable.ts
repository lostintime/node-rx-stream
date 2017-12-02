import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable} from 'funfix';
import SyncBufferedSubscriber from "../observers/buffers/SyncBufferedSubscriber";

export default class CreateObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _fn: (s: Subscriber.Sync<A>) => Cancelable) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    // TODO add OverflowStrategy support, select buffer depending on overflow strategy
    const out = SyncBufferedSubscriber.unbounded(subscriber);
    try {
      return this._fn(out);
    } catch (e) {
      subscriber.scheduler.reportFailure(e);
      return Cancelable.empty();
    }
  }
}
