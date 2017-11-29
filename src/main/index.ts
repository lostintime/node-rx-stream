import Observable from "./lib/Observable";
import {Continue, Subscriber, Throwable} from "./lib/Reactive";
import {debug} from "util";


// TODO implement prefetch Processor - keep an N items buffer full while pushing items to downstream

// const items = Observable.loop();
// const items = Observable.range(0, 10);
// const items = Observable.empty<number>();
// const items = Observable.range(0, 10000000);
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
  .flatMap(s => {
    console.log('========================================================>', s);
    return Observable.items(`a: ${s}`);
  })
  .bufferWithPressure(4)
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
