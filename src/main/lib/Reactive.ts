import {Future} from 'funfix';

export type Throwable = Error | Object;

export interface Cancelable {
  cancel(): void;
}

export interface Subscription extends Cancelable {
  request(n: number): void;
}

export type AckStop = 'stop';
export type AckContinue = 'continue';
export type SyncAck = AckStop | AckContinue;
export type AsyncAck = Future<SyncAck>
export const Stop: AckStop = 'stop';
export const Continue: AckContinue = 'continue';

export type Ack = SyncAck | AsyncAck


export interface Subscriber<T> {
  onComplete(): void;

  onError(e: Throwable): void;

  onNext(t: T): Ack;

  onSubscribe(s: Subscription): void;
}

export interface Publisher<T> {
  subscribe(s: Subscriber<T>): void;
}

export interface Processor<T> extends Publisher<T>, Subscriber<T> {

}
