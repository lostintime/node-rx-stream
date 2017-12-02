import {Ack, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';


export default class DefaultIfEmptySubscriber<A> implements Subscriber<A> {
  private _isEmpty = true;

  constructor(private readonly _out: Subscriber<A>,
              private readonly _defaultV: () => A,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isEmpty) {
      this._isEmpty = false;
    }

    return this._out.onNext(elem);
  }

  onComplete(): void {
    if (this._isEmpty) {
      let streamErrors = true;
      try {
        const value = this._defaultV();
        streamErrors = false;

        this._out.onNext(value);
        this._out.onComplete();
      } catch (e) {
        if (streamErrors) {
          this._out.onError(e);
        }
      }
    }
  }

  onError(e: Throwable): void {
    this._out.onError(e);
  }
}
