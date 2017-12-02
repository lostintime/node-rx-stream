import ObservableInstance from "../ObservableInstance";
import {Ack, Continue, Subscriber} from "../../Reactive";
import {Throwable, Scheduler, MultiAssignCancelable, Cancelable} from "funfix";

export default class OnErrorRetryIfObservable<A> extends ObservableInstance<A> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _p: (e: Throwable) => boolean) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const task = MultiAssignCancelable.empty();
    this.loop(out, task, 0);

    return task;
  }

  loop(out: Subscriber<A>, task: MultiAssignCancelable, retryIdx: number): void {
    const cancelable = this._source.unsafeSubscribeFn(new OnErrorRetryIfSubscriber(this, out, task, this._p, retryIdx));
    task.update(cancelable);
  }
}


class OnErrorRetryIfSubscriber<A> implements Subscriber<A> {
  private _isDone = false;
  private _ack: Ack = Continue;

  constructor(private readonly _parent: OnErrorRetryIfObservable<A>,
              private readonly _out: Subscriber<A>,
              private readonly _task: MultiAssignCancelable,
              private readonly _p: (e: Throwable) => boolean,
              private readonly _retryIdx: number,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._ack = this._out.onNext(elem);
    return this._ack;
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

      let streamError = true;
      try {
        const shouldRetry = this._p(e);
        streamError = false;
        if (shouldRetry) {
          this.scheduler.trampoline(() => {
            this._parent.loop(this._out, this._task, this._retryIdx + 1);
          });
        } else {
          this._out.onError(e);
        }
      } catch (e) {
        if (streamError) {
          this.scheduler.reportFailure(e);
          this._out.onError(e);
        }
      }
    }
  }
}
