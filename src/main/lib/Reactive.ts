import {Future, Try, Success, Scheduler} from 'funfix';

export type Throwable = Error | Object;

export interface Cancelable {
  cancel(): void;
}

export type AckStop = 'stop';
export type AckContinue = 'continue';
export type SyncAck = AckStop | AckContinue;
export type AsyncAck = Future<SyncAck>
export const Stop: AckStop = 'stop';
export const Continue: AckContinue = 'continue';

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

/**
 * @deprecated use Ack.syncOn()
 */
export const ackSyncOn = Ack.syncOn;

/**
 * @deprecated use Ack.syncOnContinue()
 */
export const ackSyncOnContinue = Ack.syncOnContinue;

/**
 * @deprecated use Ack.syncOnStopOrFailure()
 */
export const ackSyncOnStopOrFailure = Ack.syncOnStopOrFailure;


export interface Observer<T> {
  onNext(elem: T): Ack;

  onComplete(): void;

  onError(e: Throwable): void;
}

export interface Subscriber<T> extends Observer<T> {
  readonly scheduler: Scheduler // FIXME transform to a method
}

export type Operator<I, O> = (s: Subscriber<O>) => Subscriber<I>;
