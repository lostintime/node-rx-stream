import ObservableInstance from "../ObservableInstance";
import {Subscriber} from "../../Reactive";
import {Cancelable, IO} from "funfix";


export default class TaskAsObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _task: IO<A>) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    return this._task.runOnComplete((result) => {
      if (result.isSuccess()) {
        out.onNext(result.get());
        out.onComplete();
      } else {
        out.onError(result.failed().get());
      }
    }, out.scheduler)
  }
}
