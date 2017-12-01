import ObservableInstance from "../ObservableInstance";
import {IO, Cancelable, MultiAssignCancelable, Scheduler, Throwable, Option, Some, None} from 'funfix';
import {Ack, AsyncAck, Continue, Stop, Subscriber, SyncAck} from "../../Reactive";
import {MapIOState} from "./MapIOObservable";

export default class ScanTaskObservable<A, S> extends ObservableInstance<S> {

  constructor(private readonly _source: ObservableInstance<A>,
              private readonly _seed: () => IO<S>,
              private readonly _op: (s: S, a: A) => IO<S>) {
    super();
  }

  unsafeSubscribeFn(out: Subscriber<S>): Cancelable {
    const conn = MultiAssignCancelable.empty();

    return conn.update(this._seed().run(out.scheduler).transform((err) => {
      out.onError(err);
    }, (initial) => {
      const subscriber = new ScanTaskSubscriber(out, initial, this._op);
      const mainSubscription = this._source.unsafeSubscribeFn(subscriber);
      const c = Cancelable.of(() => {
        try {
          mainSubscription.cancel();
        } catch (e) {
          subscriber.cancel();
        }
      });
      conn.update(c);
    }));
  }
}


class ScanTaskSubscriber<A, S> implements Subscriber<A>, Cancelable {
  private _state: MapIOState = MapIOState.WaitOnNext;
  private _currentS: S;

  constructor(private readonly _out: Subscriber<S>,
              private readonly _initial: S,
              private readonly _op: (s: S, a: A) => IO<S>,
              readonly scheduler: Scheduler = _out.scheduler) {
    this._currentS = _initial;
  }


  cancel(): void {
    switch (this._state._tag) {
      case 'Active':
        const active = this._state;
        this._state = MapIOState.Canceled;
        active.ref.cancel();
        break;
      case 'WaitComplete':
        const waitRef = this._state.ref;
        if (waitRef !== null) {
          this._state = MapIOState.Canceled;
          waitRef.cancel();
        }
        break;
      case 'WaitOnNext':
        this._state = MapIOState.Canceled;
        break;
      case 'WaitActiveTask':
        this._state = MapIOState.Canceled;
        break;
      case 'Canceled':
        break;
    }
  }

  onNext(elem: A): Ack {
    let streamErrors = true;
    try {
      const task: IO<SyncAck> = this._op(this._currentS, elem).transformWith(error => {
        const oldState = this._state;
        this._state = MapIOState.WaitComplete(Some(error), null);
        switch (oldState._tag) {
          case 'WaitActiveTask':
            return IO.of(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'WaitOnNext':
            return IO.of(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'Active':
            return IO.of(() => {
              this._out.onError(error);
              return Stop;
            });
          case 'WaitComplete':
            oldState.ex.forEach((e) => {
              this.scheduler.reportFailure(e);
            });
            this._out.onError(error);
            return IO.pure(Stop);
          case 'Canceled':
            this.scheduler.reportFailure(error);
            return IO.pure(Stop);
        }
      }, value => {
        this._currentS = value;

        const next = this._out.onNext(value);

        const oldState = this._state;
        this._state = MapIOState.WaitOnNext;

        switch (oldState._tag) {
          case 'WaitActiveTask':
            return (next === Continue || next === Stop) ? IO.pure(next) : IO.fromFuture(next);
          case 'WaitOnNext':
            return (next === Continue || next === Stop) ? IO.pure(next) : IO.fromFuture(next);
          case 'Active':
            return (next === Continue || next === Stop) ? IO.pure(next) : IO.fromFuture(next);
          case 'Canceled':
            return IO.pure(Stop);
          case 'WaitComplete':
            const exOpt = oldState.ex;
            exOpt.fold(() => {
              this._out.onComplete();
            }, (e) => {
              this._out.onError(e);
            });

            return IO.pure(Stop);
        }
      });

      streamErrors = false;
      this._state = MapIOState.WaitActiveTask as MapIOState; // compiler fails without task
      const ack: AsyncAck = task.run(this.scheduler);

      const oldState: MapIOState = this._state;
      this._state = MapIOState.Active(ack);

      switch (oldState._tag) {
        case 'WaitOnNext':
          this._state = MapIOState.WaitOnNext;
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
          this.reportInvalidState(oldState, 'onNext');
          return Stop;
        default:
          this.reportInvalidState(oldState, 'onNext 2');
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

    const oldState: MapIOState = this._state;
    this._state = MapIOState.WaitComplete(ex, childRef);
    switch (oldState._tag) {
      case 'WaitOnNext':
        if (ex.isEmpty()) {
          this._out.onComplete();
        } else {
          this._out.onError(ex.get());
        }
        this._state = MapIOState.Canceled;
        break;
      case 'WaitComplete':
        this._state = oldState;
        break;
      case 'Canceled':
        this._state = oldState;
        break;
      case 'Active':
        // pass
        break;
      case 'WaitActiveTask':
        this.reportInvalidState(MapIOState.WaitActiveTask, 'signalFinish');
        break;
    }
  }

  onComplete(): void {
    this.signalFinish(None);
  }

  onError(e: Throwable): void {
    this.signalFinish(Some(e))
  }

  private reportInvalidState(state: MapIOState, method: string): void {
    this.scheduler.reportFailure(new Error(
      `State ${state._tag} in ScanIOSubscriber.${method} is invalid, 
      due to either broken Subscriber implementation or a bug`
    ));
  }
}
