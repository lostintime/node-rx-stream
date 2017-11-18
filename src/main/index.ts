import Observable from "./lib/Observable";
import {Ack, Cancelable, Continue, Stop, Subscriber, Throwable} from "./lib/Reactive";
import {Future, Scheduler} from 'funfix';
import BackPressuredBufferedSubscriber from "./lib/internal/observers/buffers/BackPressuredBufferedSubscriber";
import {debug} from "util";


class DebugSubscriber<T> implements Subscriber<T> {
  readonly scheduler: Scheduler;

  constructor(scheduler?: Scheduler) {
    this.scheduler = scheduler || Scheduler.global.get();
  }

  onComplete(): void {
    console.log('debug.onComplete');
  }

  onError(e: Throwable): void {
    console.log('debug.onError', e);
  }

  onNext(t: T): Ack {
    console.log('debug.onNext()', t);
    return Continue;
    // return Future.pure(Continue);
  }
}

// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

const items = Observable.range(0, 100);

const dbg = new DebugSubscriber();
const bp = new BackPressuredBufferedSubscriber(dbg, 4);

items.subscribe(bp);
