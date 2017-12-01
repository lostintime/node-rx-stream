import ObservableInstance from "../ObservableInstance";
import {IO, Option, Some, None, Cancelable} from 'funfix'
import {Ack, Continue, Stop, Subscriber, SyncAck, Throwable} from "../../Reactive";

export default class MapIOObservable<A, B>  extends ObservableInstance<B> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _fn: (elem: A) => IO<B>) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<B>): Cancelable {
    const subscriber = new MapAsyncSubscriber(out, this._fn);
    const mainSubscription = this._source.unsafeSubscribeFn(subscriber);

    return {
      cancel: () => {
        try {
          mainSubscription.cancel();
        } finally {
          subscriber.cancel()
        }
      }
    }
  }
}

class MapAsyncSubscriber<A, B> implements Subscriber<A>, Cancelable {

  private _state: MapTaskState = MapTaskState.WaitOnNext;

  constructor(private readonly _out: Subscriber<B>,
              private readonly _fn: (elem: A) => IO<B>,
              readonly scheduler = _out.scheduler) {
  }

  private stateCompareAndSet(expect: MapTaskState, update: MapTaskState): boolean {
    if (this._state === expect) {
      this._state = update;
      return true;
    }

    return false;
  }

  private stateGetAndSet(update: MapTaskState): MapTaskState {
    const previous = this._state;
    this._state = update;
    return previous;
  }

  cancel(): void {
    const current: MapTaskState = this._state;
    // TODO cleanup, original code designed for parallelism
    switch (current._tag) {
      case 'Active':
        if (this.stateCompareAndSet(current, MapTaskState.Canceled)) {
          current.ref.cancel();
        } else {
          this.cancel() // retry
        }
        break;
      case 'WaitComplete':
        if (current.ref !== null) {
          if (this.stateCompareAndSet(current, MapTaskState.Canceled)) {
            current.ref.cancel();
          } else {
            this.cancel(); // retry
          }
        }
        break;
      case 'WaitOnNext':
        if (!this.stateCompareAndSet(current, MapTaskState.Canceled)) {
          this.cancel(); // retry
        }
        break;
      case 'WaitActiveTask':
        if (!this.stateCompareAndSet(current, MapTaskState.Canceled)) {
          this.cancel(); // retry
        }
        break;
      case 'Canceled':
        // pass
        break;
    }
  }

  onNext(elem: A): Ack {
    let streamErrors = true;
    try {
      const task: IO<SyncAck> = this._fn(elem).transformWith(error => {
        const previous = this.stateGetAndSet(MapTaskState.WaitComplete(Some(error), null));
        switch (previous._tag) {
          case 'WaitActiveTask':
            return IO.once(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'WaitOnNext':
            return IO.once(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'Active':
            return IO.once(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'WaitComplete':
            previous.ex.forEach((e) => {
              this.scheduler.reportFailure(e);
            });
            this._out.onError(error);
            return IO.pure(Stop);
          case 'Canceled':
            this.scheduler.reportFailure(error);
            return IO.pure(Stop);
        }
      }, value => {
        const next = this._out.onNext(value);
        const previous = this.stateGetAndSet(MapTaskState.WaitOnNext);
        switch (previous._tag) {
          case 'WaitActiveTask':
            if (next === Stop || next === Continue) {
              return IO.pure(next)
            } else {
              return IO.fromFuture(next);
            }
          case 'WaitOnNext':
            if (next === Stop || next === Continue) {
              return IO.pure(next)
            } else {
              return IO.fromFuture(next);
            }
          case 'Active':
            if (next === Stop || next === Continue) {
              return IO.pure(next)
            } else {
              return IO.fromFuture(next);
            }
          case 'Canceled':
            return IO.pure(Stop);
          case 'WaitComplete':
            if (previous.ex.isEmpty()) {
              this._out.onComplete();
            } else {
              this._out.onError(previous.ex.get());
            }
            return IO.pure(Stop);
        }
      });

      streamErrors = false;
      this.stateGetAndSet(MapTaskState.WaitActiveTask);

      const ack = task.run(this.scheduler);

      const previous: MapTaskState = this.stateGetAndSet(MapTaskState.Active(ack));
      switch (previous._tag) {
        case 'WaitOnNext':
          this.stateGetAndSet(MapTaskState.WaitOnNext);
          return Ack.syncTryFlatten(ack, this.scheduler);
        case 'WaitActiveTask':
          return ack;
        case 'WaitComplete':
          return Stop;
        case 'Canceled':
          ack.cancel();
          this.cancel();
          return Stop;
        case 'Active':
          this.reportInvalidState(previous, "onNext");
          return Stop;
        default:
          // FIXME compiler doesn't find this switch exhaustive
          this.reportInvalidState(previous, "onNext,(2)");
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


  private signalFinish(ex: Option<Throwable>): void {
    let childRef: Cancelable | null = null;
    switch (this._state._tag) {
      case 'Active':
        childRef = this._state.ref;
        break;
      case 'WaitComplete':
        childRef = this._state.ref;
        break;
    }

    const previous = this.stateGetAndSet(MapTaskState.WaitComplete(ex, childRef));
    switch (previous._tag) {
      case 'WaitOnNext':
        if (ex.isEmpty()) {
          this._out.onComplete();
        } else {
          this._out.onError(ex.get());
        }
        this.stateGetAndSet(previous);
        break;
      case 'Active':
        break;
      case 'WaitActiveTask':
        this.reportInvalidState(MapTaskState.WaitActiveTask, "signalFinish");
        break;
    }
  }

  onComplete(): void {
    this.signalFinish(None);
  }

  onError(e: Throwable): void {
    this.signalFinish(Some(e));
  }

  private reportInvalidState(state: MapTaskState, method: string): void {
    this.scheduler.reportFailure(new Error(`State ${state._tag} in MapIOSubscriber.${method} is invalid`))
  }
}

namespace MapTaskState {
  export namespace Type {
    export type WaitOnNext = {
      readonly _tag: 'WaitOnNext'
    }

    export type WaitActiveTask = {
      readonly _tag: 'WaitActiveTask'
    }

    export type Canceled = {
      readonly _tag: 'Canceled'
    }

    export class WaitComplete {
      readonly _tag = 'WaitComplete';

      constructor(readonly ex: Option<Throwable>,
                  readonly ref: Cancelable | null) {
      }
    }

    export class Active {
      readonly _tag = 'Active';

      constructor(readonly ref: Cancelable) {
      }
    }
  }

  export const WaitOnNext: Type.WaitOnNext = {
    _tag: 'WaitOnNext'
  };

  export const WaitActiveTask: Type.WaitActiveTask = {
    _tag: 'WaitActiveTask'
  };

  export const Canceled: Type.Canceled = {
    _tag: 'Canceled'
  };

  export function WaitComplete(ex: Option<Throwable>, ref: Cancelable | null): Type.WaitComplete {
    return new Type.WaitComplete(ex, ref);
  }

  export function Active(ref: Cancelable): Type.Active {
    return new Type.Active(ref);
  }
}

type MapTaskState = MapTaskState.Type.WaitOnNext
  | MapTaskState.Type.WaitActiveTask
  | MapTaskState.Type.Canceled
  | MapTaskState.Type.WaitComplete
  | MapTaskState.Type.Active;
