import ObservableInstance from "../ObservableInstance";
import {Cancelable, Subscriber} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";

export default class EvalAlwaysObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _fn: () => A) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    try {
      subscriber.onNext(this._fn());
      // No need to do back-pressure
      subscriber.onComplete();
    } catch (e) {
      try {
        subscriber.onError(e);
      } catch (e2) {
        const scheduler = subscriber.scheduler;
        scheduler.reportFailure(e);
        scheduler.reportFailure(e2);
      }
    }

    return new EmptyCancelable();
  }
}
