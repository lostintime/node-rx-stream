import {Future, Scheduler} from 'funfix';

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


export interface Observer<T> {
  onNext(elem: T): Ack;

  onComplete(): void;

  onError(e: Throwable): void;
}

export interface Subscriber<T> extends Observer<T> {
  readonly scheduler: Scheduler // FIXME transform to a method
}

export type Operator<I, O> = (s: Subscriber<O>) => Subscriber<I>;
