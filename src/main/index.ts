import Observable from "./lib/Observable";
import {Ack, Cancelable, Continue, Stop, Subscriber, Subscription, Throwable} from "./lib/Reactive";
import ObservableInstance from "./lib/internal/ObservableInstance";
import {Future} from 'funfix';


class OnNextSubscriber<T> implements Subscriber<T> {
  private readonly _fn: (t: T) => Ack;

  constructor(fn: (t: T) => Ack) {
    this._fn = fn;
  }

  onComplete(): void {
  }

  onError(e: Throwable): void {
  }

  onNext(t: T): Ack {
    return this._fn(t);
  }

  onSubscribe(s: Subscription): void {
  }
}


// TODO implement new Observable which issue a value, or function result forever (or limited times), backpressed!
// https://github.com/monix/monix/tree/master/monix-reactive/shared/src/main/scala/monix/reactive/internal/builders

// const ss = Observable.now(10);
// const ss = Observable.loop();
const ss = Observable.range(0, 1000000000);

// const ss = new EvalWhileDefinedObservable();

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
