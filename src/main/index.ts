import Observable from "./lib/Observable";
import {Ack, Cancelable, Continue, Stop, Subscriber, Throwable} from "./lib/Reactive";
import {Future, Scheduler} from 'funfix';


class OnNextSubscriber<T> implements Subscriber<T> {
  private readonly _fn: (t: T) => Ack;
  readonly scheduler: Scheduler;

  constructor(fn: (t: T) => Ack, scheduler?: Scheduler) {
    this._fn = fn;
    this.scheduler = scheduler || Scheduler.global.get();
  }

  onComplete(): void {
  }

  onError(e: Throwable): void {
  }

  onNext(t: T): Ack {
    return this._fn(t);
  }
}

// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

// const ss = Observable.now(10);
// const ss = Observable.loop();
const ss = Observable.range(0, 1000000000);

function process(v: number): Ack {
  if (v % 1000000 === 0) {
    console.log('got value', v);
  }
  // const arr: number[] = [];
  // for (let i = 0; i < 10000; i++) {
  //   arr.push(v);
  // }
  //
  // return arr.length > 0 ? Continue : Continue;

  return Continue;
  // return Future.pure(Continue).delayResult(300);
}

ss.subscribe(new OnNextSubscriber(process));
