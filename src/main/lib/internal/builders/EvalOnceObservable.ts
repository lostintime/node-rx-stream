import ObservableInstance from "../ObservableInstance";
import {Cancelable, Subscriber, Throwable} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";


export default class EvalOnceObservable<A> extends ObservableInstance<A> {
  private _result: A;
  private _errorThrown: Throwable | null = null;
  private _hasResult: boolean = false;

  constructor(private readonly _eval: () => A) {
    super()
  }

  private signalResult(out: Subscriber<A>, value: A, ex: Throwable | null): void {
    if (ex !== null) {
      try {
        out.onError(ex);
      } catch (e) {
        out.scheduler.reportFailure(e);
        out.scheduler.reportFailure(ex);
      }
    } else {
      try {
        out.onNext(value);
        out.onComplete();
      } catch (e) {
        out.scheduler.reportFailure(e);
      }
    }
  }

  unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable {
    if (!this._hasResult) {
      try {
        this._result = this._eval();
      } catch (e) {
        this._errorThrown = e;
      }
      this._hasResult = true;
    }

    this.signalResult(subscriber, this._result, this._errorThrown);

    return EmptyCancelable;
  }
}
