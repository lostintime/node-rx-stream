import Observable from "./lib/Observable";
import {Ack, Continue, Subscriber, Throwable} from "./lib/Reactive";
import {Scheduler} from 'funfix';
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
    console.log(`debug.onNext(${t})`);
    return Continue;
    // return Future.pure(Continue);
  }
}

// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

// const items = Observable.loop();
// const items = Observable.range(0, 10);
// const items = Observable.empty<number>();
// const items = Observable.range(0, 10000000);
const items = Observable.items(0, 1, 2, 3, 4, 5, 6, 7, 8);

const dbg = new DebugSubscriber();
const bp = new BackPressuredBufferedSubscriber(dbg, 4);

items
// .filter(a => a % 2 == 0)
// .map(a => {
//   // console.log('map item', a);
//   return `item ${a}`;
// })
  .flatMap(s => {
    console.log('========================================================>', s);
    return Observable.items(`a: ${s}`);
  })
  .subscribe(bp);
