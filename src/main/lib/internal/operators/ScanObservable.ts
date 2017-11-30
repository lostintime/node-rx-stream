import ObservableInstance from "../ObservableInstance";
import {Ack, Cancelable, Stop, Subscriber, Throwable} from "../../Reactive";
import EmptyCancelable from "../cancelables/EmptyCancelable";
import {Scheduler} from 'funfix';


class ScanSubscriber<A, R> implements Subscriber<A> {
  private _isDone: boolean = false;

  constructor(private _state: R,
              private readonly _fn: (r: R, a: A) => R,
              private readonly _out: Subscriber<R>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    let streamError = true;
    try {
      this._state = this._fn(this._state, elem);
      streamError = false;
      return this._out.onNext(this._state);
    } catch (e) {
      if (streamError) {
        this.onError(e)
      }
      return Stop;
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;
      this._out.onComplete();
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;
      this._out.onError(e);
    }
  }
}

export default class ScanObservable<A, R> extends ObservableInstance<R> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _initial: () => R,
              private readonly _fn: (r: R, a: A) => R) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<R>): Cancelable {
    let streamErrors = true;
    try {
      const initialState = this._initial();
      streamErrors = false;

      return this._source.unsafeSubscribeFn(new ScanSubscriber(initialState, this._fn, out));
    } catch (e) {
      if (streamErrors) {
        out.onError(e);
      }

      return new EmptyCancelable();
    }
  }
}
