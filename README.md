RxStream
========

TypeScript port of [Monix](https://github.com/monix/monix) reactive streams module.
All credits goes to [monix authors](https://github.com/monix/monix/graphs/contributors)!

## WARNING! Work in progress!

This library is [Work in Progress](./TODO.md), api may change until version `1.0.0`.


## Usage

Install `rx-stream` library:

```$bash
npm install --save rx-stream
```

### Hello World

Create an `Observable` and observe it's events:

```$typescript
import Observable from 'rx-stream';
import {Future} from 'funfix';

Observable.range(0, 10)
    .mapFuture(n => Future.pure(n).delayResult(1000))
    .foreach((e) => {
        console.log('got item', e);
    })
```

### `takeUntil` for synchronous sources

For synchronous sources, in order to use `takeUntil` and `onErrorRestart` - need to add 
_asyncBoundary_ (ex: `bufferWithPressure`), otherwise event loop may never reach `takeUntil`

```$typescript
let failed = false;

Observable.loop()
  .map((n): number => {
    // will throw here
    if (n == 3  && !failed) {
      failed = true;
      throw new Error('something went wrong');
    }

    return n;
  })
  .bufferWithPressure(10) // this will break synchronous loop, to "make room" async events (sigTrigger)
  .onErrorRestartUnlimited()
  .takeUntil(sigTrigger)

```

## Documentation

More usage examples and documentation will come closer to version `1.0`



## License

All code in this repository is licensed under the Apache License, Version 2.0. See [LICENCE](./LICENSE).
