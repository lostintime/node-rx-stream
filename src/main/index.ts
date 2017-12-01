import Observable from "./lib/Observable";
import {Continue, Stop} from "./lib/Reactive";
import {IO, Future, Scheduler, Try, Success, Failure} from 'funfix';
import {SIGINT} from "constants";

// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

// const items = Observable.loop();
// const items = Observable.range(0, 10);
// const items = Observable.empty<number>();
// const items = Observable.range(0, 100000000);
// const items = Observable.range(0, 100);
const items = Observable.items(0, 1, 2, 3, 4, 5, 6, 7, 8);
// const items =Observable.repeatEval(() => 1);
// const items = Observable.evalOnce(() => 123);
// const items = Observable.pure(1);

const sigintTrigger = Observable.pure(0)
  .mapIO(n => IO.async((ec: Scheduler, cb: (a: Try<number>) => void): void => {
    process.on('SIGINT', () => {
      cb(Success(1));
    })
  }));

sigintTrigger.subscribe((n) => {
  console.log('got SIGINT');
  return Continue;
});


items
// .filter(a => a % 2 == 0)
// .map(a => {
//   // console.log('map item', a);
//   return `item ${a}`;
// })
//   .flatMap(s => {
//     // console.log('========================================================>', s);
//     return Observable.items(`a: ${s}`);
//   })
//   .bufferWithPressure(4)
//   .subscribe();
  .scanTask(() => IO.pure(0), (s, a) => IO.pure(s + a).delayResult(1000))
  // .map((i => {
  //   // if (i == 7) {
  //   //   throw new Error('something went wrong');
  //   // }
  //   return i * 100
  // }))
  // .mapIO(i => IO.pure(i / 10))
  // .mapFuture(i => {
  //   return Future.pure(i * 1000).delayResult(1000)
  // })
  // .bufferTumbling(5)
  // .subscribe(
  //   undefined,
  //     (e) => {
  //       console.log('debug.onError', e);
  //     },
  //     () => {
  //       console.log('debug.onComplete');
  //     }
  // )
  .takeUntil(sigintTrigger)
  .subscribe(
    (t) => {
      console.log(`debug.onNext(${t})`);
      return Continue;
    },
    (e) => {
      console.log('debug.onError', e);
    },
    () => {
      console.log('debug.onComplete');
    }
  );
