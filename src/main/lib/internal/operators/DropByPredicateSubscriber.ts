import {Ack, Continue, Stop, Subscriber, Throwable} from "../../Reactive";
import {Scheduler} from 'funfix';


export default class DropByPredicateSubscriber<A> implements Subscriber<A> {
  private _continueDropping: boolean = true;
  private _isDone: boolean = false;

  constructor(private readonly _pred: (elem: A) => boolean,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._continueDropping) {
      let streamError = true;
      try {
        const isStillInvalid = this._pred(elem);
        streamError = false;

        if (isStillInvalid) {
          return Continue;
        } else {
          this._continueDropping = false;
          return this._out.onNext(elem);
        }
      } catch (e) {
        if (streamError) {
          this.onError(e);
        }

        return Stop;
      }
    } else {
      return this._out.onNext(elem);
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
      this.onError(e)
    }
  }
}
