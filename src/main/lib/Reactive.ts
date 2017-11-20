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

// TODO find home for Ack methods
export function ackSyncOn(ack: Ack, callback: (t: Try<SyncAck>) => void): Ack {
  if (ack === Continue || ack === Stop) {
    callback(Success(ack));
  } else {
    ack.onComplete((result) => {
      callback(result);
    });
  }

  return ack;
}

export function ackSyncOnContinue(ack: Ack, callback: () => void): Ack {
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

export function ackSyncOnStopOrFailure(ack: Ack, callback: () => void): Ack {
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

export interface Observer<T> {
  onNext(elem: T): Ack;

  onComplete(): void;

  onError(e: Throwable): void;
}

export interface Subscriber<T> extends Observer<T> {
  readonly scheduler: Scheduler // FIXME transform to a method
}

export type Operator<I, O> = (s: Subscriber<O>) => Subscriber<I>;
