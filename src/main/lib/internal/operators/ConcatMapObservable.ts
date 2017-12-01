import ObservableInstance from "../ObservableInstance";
import {
  Ack, Continue, Stop, Subscriber, SyncAck, ackSyncOn, ackSyncOnStopOrFailure, AsyncAck
} from "../../Reactive";
import {Scheduler, Option, None, Some, FutureMaker, Cancelable, Throwable} from 'funfix';


export default class ConcatMapObservable<A, B> extends ObservableInstance<B> {
  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _fn: (a: A) => ObservableInstance<B>,
              private readonly _delayErrors: boolean) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<B>): Cancelable {
    const subscriber = new ConcatMapSubscriber(out, this._fn, this._delayErrors);
    const mainSubscription = this._source.unsafeSubscribeFn(subscriber);

    return {
      cancel: () => {
        try {
          mainSubscription.cancel()
        } finally {
          subscriber.cancel();
        }
      }
    };
  }
}

class ChildSubscriber<B> implements Subscriber<B> {
  private _ack: Ack = Continue;

  constructor(private readonly _out: Subscriber<B>,
              private readonly _errors: Throwable[],
              private readonly _stateGetAndSet: (newState: FlatMapState) => FlatMapState,
              private readonly _delayErrors: boolean,
              private readonly _asyncUpstreamAck: FutureMaker<SyncAck>,
              private readonly _sendOnComplete: () => void,
              readonly scheduler: Scheduler = _out.scheduler) {
  }

  onNext(elem: B): Ack {
    this._ack = this._out.onNext(elem);
    return ackSyncOnStopOrFailure(this._ack, () => this.signalChildOnComplete(this._ack, true));
  }

  onComplete(): void {
    this.signalChildOnComplete(this._ack, false);
  }

  onError(e: Throwable): void {
    if (!this._delayErrors) {
      this.signalChildOnError(e);
    } else {
      this._errors.push(e);
      this.onComplete();
    }
  }

  private signalChildOnError(ex: Throwable): void {
    const oldState = this._stateGetAndSet(FlatMapState.WaitComplete(Some(ex), Cancelable.empty()));
    switch (oldState.kind) {
      case 'WaitOnActiveChild':
        this._out.onError(ex);
        this._asyncUpstreamAck.trySuccess(Stop);
        break;
      case 'WaitOnNextChild':
        this._out.onError(ex);
        this._asyncUpstreamAck.trySuccess(Stop);
        break;
      case 'Active':
        this._out.onError(ex);
        this._asyncUpstreamAck.trySuccess(Stop);
        break;
      case 'WaitComplete':
        oldState.ex.forEach((e: Throwable) => {
          this.scheduler.reportFailure(e);
        });
        this._out.onError(oldState.ex);
        this._asyncUpstreamAck.trySuccess(Stop);
        break;
      case 'Canceled':
        this.scheduler.reportFailure(ex);
        break;
    }
  }

  private signalChildOnComplete(ack: Ack, isStop: boolean): void {
    const oldState = this._stateGetAndSet(FlatMapState.WaitOnNextChild(ack));
    switch (oldState.kind) {
      case 'WaitOnActiveChild':
        // pass
        break;
      case 'WaitOnNextChild':
        ackSyncOn(ack, (syncAck) => this._asyncUpstreamAck.tryComplete(syncAck));
        break;
      case 'Active':
        ackSyncOn(ack, (syncAck) => this._asyncUpstreamAck.tryComplete(syncAck));
        break;
      case 'Canceled':
        this._asyncUpstreamAck.trySuccess(Stop);
        break;
      case 'WaitComplete':
        if (!isStop) {
          oldState.ex.fold(() => this._sendOnComplete(), (e) => this._out.onError(e));
        } else {
          ackSyncOn(ack, (r) => {
            r.failed().forEach((e) => {
              this.scheduler.reportFailure(e);
            })
          })
        }
    }
  }
}


export class ConcatMapSubscriber<A, B> implements Subscriber<A>, Cancelable {
  private _errors: Throwable[] = [];
  private _state: FlatMapState = FlatMapState.WaitOnNextChild(Continue);

  constructor(private readonly _out: Subscriber<B>,
              private readonly _fn: (a: A) => ObservableInstance<B>,
              private readonly _delayErrors: boolean,
              readonly scheduler: Scheduler = _out.scheduler) {

  }

  private stateSetAndGet(newState: FlatMapState): FlatMapState {
    const oldState = this._state;
    this._state = newState;
    return oldState;
  }

  onNext(elem: A): Ack {
    let streamErrors = true;
    try {
      const asyncUpstreamAck = FutureMaker.empty<SyncAck>();
      const child = this._fn(elem);
      // No longer allowed to stream errors downstream
      streamErrors = false;

      this.stateSetAndGet(FlatMapState.WaitOnActiveChild);

      let cancelable = child.unsafeSubscribeFn(new ChildSubscriber(
        this._out,
        this._errors,
        (newState) => {
          return this.stateSetAndGet(newState);
        },
        this._delayErrors,
        asyncUpstreamAck,
        () => {
          this.sendOnComplete()
        },
        this.scheduler
      ));

      const oldState: FlatMapState = this.stateSetAndGet(FlatMapState.Active(cancelable));

      switch (oldState.kind) {
        case 'WaitOnNextChild':
          // Task execution was synchronous, w00t, so redo state!
          this.stateSetAndGet(oldState);
          const ack: Ack = oldState.ack;
          if (ack === Continue || ack === Stop) {
            return ack;
          } else {
            return ack.recover(e => {
              this.scheduler.reportFailure(e);
              return Stop;
            })
          }
        case 'WaitOnActiveChild':
          // Expected outcome for async observables
          const acAck: AsyncAck = asyncUpstreamAck.future();
          return acAck.recover(e => {
            this.scheduler.reportFailure(e);
            return Stop;
          });
        case 'WaitComplete':
          // Branch that can happen in case the child has finished
          // already in error, so stop further onNext events.
          this.stateSetAndGet(oldState);
          return Stop;
        case 'Canceled':
          // Race condition, oops, now cancel the active task
          cancelable.cancel();
          // Now restore the state and pretend that this didn't
          // happen :-) Note that this is probably going to call
          // `ack.cancel()` a second time, but that's OK
          this.cancel();
          return Stop;
        case 'Active':
          // This should never, ever happen!
          // Something is screwed up in our state machine :-(
          cancelable.cancel();
          return Stop;
        default:
          // FIXME - find why compiler is not satisfied by specified cases!
          return Stop;
      }
    } catch (e) {
      if (streamErrors) {
        this.onError(e);
        return Stop;
      } else {
        this.scheduler.reportFailure(e);
        return Stop;
      }
    }
  }

  onComplete(): void {
    this.signalFinish(None);
  }

  onError(ex: Throwable): void {
    if (!this._delayErrors) {
      this.signalFinish(Some(ex))
    } else {
      this._errors.push(ex);
      this.signalFinish(None);
    }
  }

  cancel(): void {
    switch (this._state.kind) {
      case 'Active':
        const activeRef = this._state.ref;
        this.stateSetAndGet(FlatMapState.Canceled);
        activeRef.cancel();
        break;
      case 'WaitComplete':
        const waitRef = this._state.ref;
        this.stateSetAndGet(FlatMapState.Canceled);
        waitRef.cancel();
        break;
      case 'Canceled':
        // pass
        break;
    }
  }

  private signalFinish(ex: Option<Throwable>): void {
    let childRef: Cancelable;

    switch (this._state.kind) {
      case 'Active':
        childRef = this._state.ref;
        break;
      case 'WaitComplete':
        childRef = this._state.ref;
        break;
      default:
        childRef = Cancelable.empty();
    }

    const oldState = this.stateSetAndGet(FlatMapState.WaitComplete(ex, childRef));

    switch (oldState.kind) {
      case 'WaitOnNextChild':
        if (ex.isEmpty()) {
          this.sendOnComplete();
        } else {
          this._out.onError(ex.get());
        }
        this.stateSetAndGet(FlatMapState.Canceled);
        break;
      case 'Active':
        // pass;
        break;
      case 'WaitComplete':
        this.stateSetAndGet(oldState);
        break;
      case 'Canceled':
        this.stateSetAndGet(oldState);
        break;
      case 'WaitOnActiveChild':
        // TODO report invalid state
        break;
    }
  }

  private sendOnComplete(): void {
    if (this._delayErrors && this._errors.length > 0) {
      // TODO add CompositeException
      this._out.onError(new Error("Something went wrong (this should be replaced with CompositeException)"));
    } else {
      this._out.onComplete()
    }
  }
}

namespace FlatMapState {
  export namespace States {
    export class WaitOnNextChild {
      readonly kind = "WaitOnNextChild";

      constructor(readonly ack: Ack) {
      }
    }

    export class WaitOnActiveChild {
      readonly kind = "WaitOnActiveChild";
    }

    export class Canceled {
      readonly kind = "Canceled";
    }

    export class WaitComplete {
      readonly kind = "WaitComplete";

      constructor(readonly ex: Option<Throwable>,
                  readonly ref: Cancelable) {
      }
    }

    export class Active {
      readonly kind = "Active";

      constructor(readonly ref: Cancelable) {
      }
    }
  }

  export function WaitOnNextChild(ack: Ack): States.WaitOnNextChild {
    return new States.WaitOnNextChild(ack);
  }

  export const WaitOnActiveChild = new States.WaitOnActiveChild();

  export const Canceled = new States.Canceled();

  export function WaitComplete(ex: Option<Throwable>, ref: Cancelable) {
    return new States.WaitComplete(ex, ref);
  }

  export function Active(ref: Cancelable) {
    return new States.Active(ref);
  }
}

export type FlatMapState = FlatMapState.States.WaitOnNextChild
  | FlatMapState.States.WaitOnActiveChild
  | FlatMapState.States.Canceled
  | FlatMapState.States.WaitComplete
  | FlatMapState.States.Active;
