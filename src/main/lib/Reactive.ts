import {Future, Try, Success, Scheduler, Throwable} from 'funfix';

export type AckStop = 'Stop';
export type AckContinue = 'Continue';
export type SyncAck = AckStop | AckContinue;
export type AsyncAck = Future<SyncAck>
export const Stop: AckStop = 'Stop';
export const Continue: AckContinue = 'Continue';

export type Ack = SyncAck | AsyncAck

export namespace Ack {
  export function syncOn(ack: Ack, callback: (t: Try<SyncAck>) => void): Ack {
    if (ack === Continue || ack === Stop) {
      callback(Success(ack));
    } else {
      ack.onComplete((result) => {
        callback(result);
      });
    }

    return ack;
  }

  export function syncOnContinue(ack: Ack, callback: () => void): Ack {
    if (ack === Continue) {
      callback();
    } else if (ack !== Stop) {
      ack.onComplete((result) => {
        if (result.isSuccess() && result.get() === Continue) {
          callback();
        }
      });
    }

    return ack;
  }

  export function syncOnStopOrFailure(ack: Ack, callback: () => void): Ack {
    if (ack === Stop) {
      callback();
    } else if (ack !== Continue) {
      ack.onComplete((result) => {
        if (result.isFailure() || result.get() === Stop) {
          callback();
        }
      })
    }

    return ack;
  }

  export function syncTryFlatten(ack: Ack, scheduler: Scheduler): Ack {
    if (ack === Continue || ack === Stop) {
      return ack;
    } else {
      const v = ack.value();
      if (v.isEmpty()) {
        return ack;
      } else {
        const t = v.get();
        if (t.isSuccess()) {
          return t.get();
        } else {
          scheduler.reportFailure(t.failed().get());
          return Stop;
        }
      }
    }
  }

}

export interface Observer<T> {
  onNext(elem: T): Ack;

  onComplete(): void;

  onError(e: Throwable): void;
}

export namespace Observer {
  export interface Sync<T> extends Observer<T> {
    onNext(elem: T): SyncAck;
  }
}

export interface WithScheduler<T> {
  readonly scheduler: Scheduler
}

export interface Subscriber<T> extends WithScheduler<T>, Observer<T> {
}

export namespace Subscriber {
  export interface Sync<T> extends WithScheduler<T>, Observer.Sync<T> {

  }
}

export type Operator<I, O> = (s: Subscriber<O>) => Subscriber<I>;
