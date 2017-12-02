import Observable from "./lib/Observable";
import {Continue, Stop} from "./lib/Reactive";
import {IO, Future, Scheduler, Try, Success, Failure, BoolCancelable} from 'funfix';
import {SIGINT} from "constants";

// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

const items = Observable.loop();
// const items = Observable.range(0, 10);
// const items = Observable.empty<number>();
// const items = Observable.range(0, 100000000);
// const items = Observable.range(0, 100);
// const items = Observable.items(0, 1, 2, 3, 4, 5, 6, 7, 8);
// const items =Observable.repeatEval(() => 1);
// const items = Observable.evalOnce(() => 123);
// const items = Observable.pure(1);

const sigTrigger: Observable<any> = Observable.create((s) => {
  const listener = () => {
    s.onNext(null);
  };

  const c = BoolCancelable.of(() => {
    process.removeListener('SIGINT', listener);
    process.removeListener('SIGTERM', listener);
  });

  process.addListener('SIGINT', listener);
  process.addListener('SIGTERM', listener);

  return c;
});

let failsCnt  = 0;

const c = items
  // .map((n): number => {
  //   // will throw here
  //   if (n == 30) {
  //     failsCnt += 1;
  //     throw new Error('something went wrong');
  //   }
  //
  //   return n;
  // })
  .onErrorRestartIf(() => failsCnt < 3)
  .bufferWithPressure(10)
  .takeUntil(sigTrigger)
  // .take(10)
  .foreachL((item) => {
    console.log('got item', item);
  })
  .run();


setTimeout(() => {
  c.cancel();
}, 10000);