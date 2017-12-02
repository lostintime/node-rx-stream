import {Ack, Continue, Subscriber} from "../../Reactive";
import {Throwable, Scheduler, MultiAssignCancelable, Cancelable} from "funfix";
import ObservableInstance from "../ObservableInstance";


export default class OnErrorRetryCountedObservable<A> extends ObservableInstance<A> {
  constructor(private readonly _source,
              private readonly _maxRetries: number) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<A>): Cancelable {
    const task = MultiAssignCancelable.empty();
    this.loop(out, task, 0);

    return task;
  }

  loop(out: Subscriber<A>, task: MultiAssignCancelable, retryIdx: number): void {
    const cancelable = this._source.unsafeSubscribeFn(new OnErrorRetryCountedSubscriber(this, out, task, this._maxRetries, retryIdx));
    task.update(cancelable);
  }
}


class OnErrorRetryCountedSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false;
  private _ack: Ack = Continue;

  constructor(private readonly _parent: OnErrorRetryCountedObservable<A>,
              private readonly _out: Subscriber<A>,
              private readonly _task: MultiAssignCancelable,
              private readonly _maxRetries: number,
              private readonly _retryIdx: number,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: A): Ack {
    this._ack = this._out.onNext(elem);
    return this._ack;
  }

  onComplete(): void {
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;

      if (this._maxRetries < 0 || this._retryIdx < this._maxRetries) {
        this.scheduler.trampoline(() => {
          Ack.syncOnContinue(this._ack, () => {
            this._parent.loop(this._out, this._task, this._retryIdx + 1);
          })
        })
      } else {
        this._out.onError(e);
      }
    }
  }
}
