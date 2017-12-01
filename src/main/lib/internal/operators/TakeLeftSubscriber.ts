import {Ack, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';

/**
 * This is an optimization for TakePositiveSubscriber
 */
export class TakeZeroSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false;

  constructor(private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this.onComplete();
    return Stop;
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

/**
 * Issue first n elements to child subscriber
 */
export class TakePositiveSubscriber<A> implements Subscriber<A> {
  private _counter: number = 0;
  private _isActive: boolean = true;

  constructor(private readonly _n: number,
              private readonly _out: Subscriber<A>,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    if (this._isActive && this._counter < this._n) {
      this._counter += 1;

      if (this._counter < this._n) {
        return this._out.onNext(elem);
      } else {
        this._isActive = false;
        this._out.onNext(elem);
        this._out.onComplete();
        return Stop;
      }
    } else {
      return Stop;
    }
  }

  onComplete(): void {
    if (this._isActive) {
      this._isActive = false;
      this._out.onComplete();
    }
  }

  onError(e: Throwable): void {
    if (this._isActive) {
      this._isActive = false;
      this._out.onError(e);
    }
  }
}
