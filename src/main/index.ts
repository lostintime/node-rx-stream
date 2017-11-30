import Observable from "./lib/Observable";
import {Continue} from "./lib/Reactive";
import {IO, Future} from 'funfix';

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
  .scan(() => 0, (s, a) => s + a)
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
