Rx Stream
=========

TypeScript port of [Monix](https://github.com/monix/monix) reactive streams library.
All credits goes to [monix authors](https://github.com/monix/monix/graphs/contributors).


## TODO

  * [ ] pending
  * [x] implemented
  * [-] won't do

`Observable` transformations

  * [x] `liftByOperator[B](operator: Operator[A, B]): Observable[B]`
  * [ ] `consumeWith[R](f: Consumer[A, R]): Task[R]`
  * [ ] `+:[B >: A](elem: B): Observable[B]` (prepend)
  * [ ] `:+[B >: A](elem: B): Observable[B]` (append)
  * [ ] `ambWith[B >: A](other: Observable[B]): Observable[B]`
  * [x] `bufferTumbling(count: Int): Observable[Seq[A]]`
  * [x] `bufferSliding(count: Int, skip: Int): Observable[Seq[A]]`
  * [ ] `bufferTimed(timespan: FiniteDuration): Observable[Seq[A]]`
  * [ ] `bufferTimedAndCounted(timespan: FiniteDuration, maxCount: Int): Observable[Seq[A]]`
  * [ ] `bufferTimedWithPressure(period: FiniteDuration, maxSize: Int): Observable[Seq[A]]`
  * [ ] `bufferWithSelector[S](selector: Observable[S]): Observable[Seq[A]]`
  * [ ] `bufferWithSelector[S](selector: Observable[S], maxSize: Int): Observable[Seq[A]]`
  * [ ] `bufferIntrospective(maxSize: Int): Observable[List[A]]`
  * [ ] `collect[B](pf: PartialFunction[A, B]): Observable[B]`
  * [ ] `combineLatest[B](other: Observable[B]): Observable[(A, B)]`
  * [ ] `combineLatestMap[B, R](other: Observable[B])(f: (A, B) => R): Observable[R]`
  * [ ] `completed: Observable[Nothing]`
  * [ ] `debounceTo[B](timeout: FiniteDuration, f: A => Observable[B]): Observable[B]`
  * [ ] `delaySubscription(timespan: FiniteDuration): Observable[A]`
  * [ ] `switchMap[B](f: A => Observable[B]): Observable[B]`
  * [ ] `debounceRepeated(period: FiniteDuration): Observable[A]`
  * [x] `defaultIfEmpty[B >: A](default: => B): Observable[B]`
  * [ ] `delayOnComplete(delay: FiniteDuration): Observable[A]`
  * [ ] `delayOnNext(duration: FiniteDuration): Observable[A]`
  * [ ] `delayOnNextBySelector[B](selector: A => Observable[B]): Observable[A]`
  * [ ] `delaySubscriptionWith(trigger: Observable[Any]): Observable[A]`
  * [ ] `dematerialize[B](implicit ev: A <:< Notification[B]): Observable[B]`
  * [ ] `distinctUntilChanged[AA >: A](implicit A: Eq[AA]): Observable[AA]`
  * [ ] `distinctUntilChangedByKey[K](key: A => K)(implicit K: Eq[K]): Observable[A]`
  * [ ] `doOnEarlyStop(cb: () => Unit): Observable[A]`
  * [ ] `doOnEarlyStopEval[F[_]](effect: F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnEarlyStopTask(task: Task[Unit]): Observable[A]`
  * [ ] `doOnSubscriptionCancel(cb: () => Unit): Observable[A]`
  * [ ] `doOnComplete(cb: () => Unit): Observable[A]`
  * [ ] `doOnCompleteEval[F[_]](effect: F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnCompleteTask(task: Task[Unit]): Observable[A]`
  * [ ] `doOnError(cb: Throwable => Unit): Observable[A]`
  * [ ] `doOnErrorEval[F[_]](cb: Throwable => F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnErrorTask(cb: Throwable => Task[Unit]): Observable[A]`
  * [ ] `doOnTerminate(cb: Option[Throwable] => Unit): Observable[A]`
  * [ ] `doOnTerminateEval[F[_]](cb: Option[Throwable] => F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnTerminateTask(cb: Option[Throwable] => Task[Unit]): Observable[A]`
  * [ ] `doAfterTerminate(cb: Option[Throwable] => Unit): Observable[A]`
  * [ ] `doAfterTerminateEval[F[_]](cb: Option[Throwable] => F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doAfterTerminateTask(cb: Option[Throwable] => Task[Unit]): Observable[A]`
  * [ ] `doOnNext(cb: A => Unit): Observable[A]`
  * [ ] `doOnNextEval[F[_]](cb: A => F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnNextTask(cb: A => Task[Unit]): Observable[A]`
  * [x] `mapTask[B](f: A => Task[B]): Observable[B]` (`mapIO`)
  * [ ] `doOnNextAck(cb: (A, Ack) => Unit): Observable[A]`
  * [ ] `doOnNextAckEval[F[_]](cb: (A, Ack) => F[Unit])(implicit F: Effect[F]): Observable[A]`
  * [ ] `doOnNextAckTask(cb: (A, Ack) => Task[Unit]): Observable[A]`
  * [ ] `doOnStart(cb: A => Unit): Observable[A]`
  * [ ] `doOnSubscribe(cb: () => Unit): Observable[A]`
  * [ ] `doAfterSubscribe(cb: () => Unit): Observable[A]`
  * [ ] `dropByTimespan(timespan: FiniteDuration): Observable[A]`
  * [ ] `dropLast(n: Int): Observable[A]`
  * [x] `dropUntil(trigger: Observable[Any]): Observable[A]`
  * [x] `dropWhile(p: A => Boolean): Observable[A]`
  * [ ] `dropWhileWithIndex(p: (A, Int) => Boolean): Observable[A]`
  * [ ] `dump(prefix: String, out: PrintStream = System.out): Observable[A]`
  * [ ] `echoOnce(timeout: FiniteDuration): Observable[A]`
  * [ ] `echoRepeated(timeout: FiniteDuration): Observable[A]`
  * [ ] `endWith[B >: A](elems: Seq[B]): Observable[B]`
  * [ ] `++[B >: A](other: Observable[B]): Observable[B]` (concat)
  * [ ] `endWithError(error: Throwable): Observable[A]`
  * [x] `failed: Observable[Throwable]`
  * [x] `firstOrElseF[B >: A](default: => B): Observable[B]`
  * [x] `headOrElseF[B >: A](default: => B): Observable[B]`
  * [x] `map[B](f: A => B): Observable[B]`
  * [x] `flatMap[B](f: A => Observable[B]): Observable[B]`
  * [x] `concatMap[B](f: A => Observable[B]): Observable[B]`
  * [x] `flatMapDelayErrors[B](f: A => Observable[B]): Observable[B]`
  * [ ] `flatMapLatest[B](f: A => Observable[B]): Observable[B]`
  * [ ] `flatScan[R](seed: => R)(op: (R, A) => Observable[R]): Observable[R]`
  * [ ] `flatScanDelayErrors[R](seed: => R)(op: (R, A) => Observable[R]): Observable[R]`
  * [-] `flatten[B](implicit ev: A <:< Observable[B]): Observable[B]` (use concatMap)
  * [-] `concat[B](implicit ev: A <:< Observable[B]): Observable[B]` (use concatMap)
  * [-] `flattenDelayErrors[B](implicit ev: A <:< Observable[B]): Observable[B`
  * [-] `concatDelayErrors[B](implicit ev: A <:< Observable[B]): Observable[B]`
  * [x] `concatMapDelayErrors[B](f: A => Observable[B]): Observable[B]`
  * [ ] `flattenLatest[B](implicit ev: A <:< Observable[B]): Observable[B]`
  * [ ] `switch[B](implicit ev: A <:< Observable[B]): Observable[B]`
  * [ ] `forAllF(p: A => Boolean): Observable[Boolean]`
  * [ ] `existsF(p: A => Boolean): Observable[Boolean]`
  * [ ] `groupBy[K](keySelector: A => K)(implicit keysBuffer: Synchronous[Nothing] = OverflowStrategy.Unbounded): Observable[GroupedObservable[K, A]]`
  * [ ] `ignoreElements: Observable[Nothing]`
  * [ ] `interleave[B >: A](other: Observable[B]): Observable[B]`
  * [x] `lastF: Observable[A] = takeLast(1)` (last)
  * [x] `takeLast(n: Int): Observable[A]`
  * [-] `mapEval[F[_], B](f: A => F[B])(implicit F: Effect[F]): Observable[B]`
  * [x] `mapFuture[B](f: A => Future[B]): Observable[B]`
  * [ ] `mapParallelUnordered[B](parallelism: Int)(f: A => Task[B])(implicit os: OverflowStrategy[B] = OverflowStrategy.Default): Observable[B]`
  * [ ] `materialize: Observable[Notification[A]]`
  * [ ] `merge[B](implicit ev: A <:< Observable[B], os: OverflowStrategy[B] = OverflowStrategy.Default): Observable[B]`
  * [ ] `mergeMap[B](f: A => Observable[B])(implicit os: OverflowStrategy[B] = OverflowStrategy.Default): Observable[B]`
  * [ ] `mergeDelayErrors[B](implicit ev: A <:< Observable[B],os: OverflowStrategy[B] = OverflowStrategy.Default): Observable[B]`
  * [ ] `mergeMapDelayErrors[B](f: A => Observable[B])(implicit os: OverflowStrategy[B] = OverflowStrategy.Default): Observable[B]`
  * [ ] `executeOn(s: Scheduler, forceAsync: Boolean = true): Observable[A]`
  * [ ] `executeWithFork: Observable[A]`
  * [ ] `executeWithModel(em: ExecutionModel): Observable[A]`
  * [ ] `observeOn(s: Scheduler): Observable[A]`
  * [ ] `observeOn[B >: A](s: Scheduler, os: OverflowStrategy[B]): Observable[B]`
  * [ ] `onCancelTriggerError: Observable[A]`
  * [x] `onErrorFallbackTo[B >: A](that: Observable[B]): Observable[B]`
  * [x] `onErrorHandle[B >: A](f: Throwable => B): Observable[B]`
  * [-] `onErrorRecover[B >: A](pf: PartialFunction[Throwable, B]): Observable[B]`
  * [-] `onErrorRecoverWith[B >: A](pf: PartialFunction[Throwable, Observable[B]]): Observable[B]`
  * [x] `onErrorHandleWith[B >: A](f: Throwable => Observable[B]): Observable[B]`
  * [x] `onErrorRestart(maxRetries: Long): Observable[A]`
  * [x] `onErrorRestartIf(p: Throwable => Boolean): Observable[A]`
  * [x] `onErrorRestartUnlimited: Observable[A]`
  * [ ] `pipeThrough[I >: A, B](pipe: Pipe[I, B]): Observable[B]`
  * [ ] `publishSelector[R](f: Observable[A] => Observable[R]): Observable[R]`
  * [ ] `pipeThroughSelector[S >: A, B, R](pipe: Pipe[S, B], f: Observable[B] => Observable[R]): Observable[R]`
  * [ ] `reduce[B >: A](op: (B, B) => B): Observable[B]`
  * [ ] `repeat: Observable[A]`
  * [ ] `restartUntil(p: A => Boolean): Observable[A]`
  * [ ] `sampleRepeated(period: FiniteDuration): Observable[A]`
  * [ ] `sampleRepeatedBy[B](sampler: Observable[B]): Observable[A]`
  * [x] `scan[S](seed: => S)(op: (S, A) => S): Observable[S]`
  * [-] `scanEval[F[_], S](seed: F[S])(op: (S, A) => F[S])(implicit F: Effect[F]): Observable[S]`
  * [x] `scanTask[S](seed: Task[S])(op: (S, A) => Task[S]): Observable[S]`
  * [ ] `startWith[B >: A](elems: Seq[B]): Observable[B]`
  * [ ] `subscribeOn(scheduler: Scheduler): Observable[A]`
  * [ ] `switchIfEmpty[B >: A](backup: Observable[B]): Observable[B]`
  * [ ] `tail: Observable[A] = drop(1)`
  * [x] `drop(n: Int): Observable[A]`
  * [ ] `takeByTimespan(timespan: FiniteDuration): Observable[A]`
  * [ ] `takeEveryNth(n: Int): Observable[A]`
  * [x] `takeUntil(trigger: Observable[Any]): Observable[A]`
  * [x] `takeWhile(p: A => Boolean): Observable[A]`
  * [ ] `takeWhileNotCanceled(c: BooleanCancelable): Observable[A]`
  * [ ] `throttleFirst(interval: FiniteDuration): Observable[A]`
  * [ ] `throttleLast(period: FiniteDuration): Observable[A]`
  * [ ] `sample(period: FiniteDuration): Observable[A]`
  * [ ] `sampleBy[B](sampler: Observable[B]): Observable[A]`
  * [ ] `throttleWithTimeout(timeout: FiniteDuration): Observable[A]`
  * [ ] `debounce(timeout: FiniteDuration): Observable[A]`
  * [ ] `timeoutOnSlowDownstream(timeout: FiniteDuration): Observable[A]`
  * [ ] `timeoutOnSlowUpstreamTo[B >: A](timeout: FiniteDuration, backup: Observable[B]): Observable[B]`
  * [ ] `timeoutOnSlowUpstream(timeout: FiniteDuration): Observable[A]`
  * [ ] `whileBusyBuffer[B >: A](overflowStrategy: OverflowStrategy.Synchronous[B]): Observable[B]`
  * [ ] `asyncBoundary[B >: A](overflowStrategy: OverflowStrategy[B]): Observable[B]`
  * [ ] `whileBusyDropEvents: Observable[A]`
  * [ ] `whileBusyDropEventsAndSignal[B >: A](onOverflow: Long => B): Observable[B]`
  * [ ] `withLatestFrom2[B1, B2, R](o1: Observable[B1], o2: Observable[B2])(f: (A, B1, B2) => R): Observable[R]`
  * [ ] `withLatestFrom3[B1, B2, B3, R](o1: Observable[B1], o2: Observable[B2], o3: Observable[B3])(f: (A, B1, B2, B3) => R): Observable[R]`
  * [ ] `withLatestFrom[B, R](other: Observable[B])(f: (A, B) => R): Observable[R]`
  * [ ] `withLatestFrom4[B1, B2, B3, B4, R](o1: Observable[B1], o2: Observable[B2], o3: Observable[B3], o4: Observable[B4])(f: (A, B1, B2, B3, B4) => R): Observable[R]`
  * [ ] `zip[B](other: Observable[B]): Observable[(A, B)]`
  * [ ] `zipMap[B, R](other: Observable[B])(f: (A, B) => R): Observable[R]`
  * [ ] `zipWithIndex: Observable[(A, Long)]`
  * [ ] `intersperse[B >: A](separator: B): Observable[B]`
  * [ ] `intersperse[B >: A](start: B, separator: B, end: B): Observable[B]`
  * [-] `toReactivePublisher[B >: A](implicit s: Scheduler): RPublisher[B]`
  * [ ] `multicast[B >: A, R](pipe: Pipe[B, R])(implicit s: Scheduler): ConnectableObservable[R]`
  * [ ] `share(implicit s: Scheduler): Observable[A]`
  * [ ] `publish(implicit s: Scheduler): ConnectableObservable[A]`
  * [ ] `cache: Observable[A]`
  * [ ] `cache(maxCapacity: Int): Observable[A]`
  * [ ] `behavior[B >: A](initialValue: B)(implicit s: Scheduler): ConnectableObservable[B]`
  * [ ] `replay(implicit s: Scheduler): ConnectableObservable[A]`
  * [ ] `replay(bufferSize: Int)(implicit s: Scheduler): ConnectableObservable[A]`
  * [ ] `unsafeMulticast[B >: A, R](processor: Subject[B, R])(implicit s: Scheduler): ConnectableObservable[R]`
  * [ ] `publishLast(implicit s: Scheduler): ConnectableObservable[A]`
  * [ ] `runAsyncGetFirst(implicit s: Scheduler): CancelableFuture[Option[A]]`
  * [ ] `runAsyncGetLast(implicit s: Scheduler): CancelableFuture[Option[A]]`
  * [x] `lastOptionL: Task[Option[A]]`
  * [x] `lastOrElseL[B >: A](default: => B): Task[B]`
  * [x] `countL: Task[Long]`
  * [x] `countF: Observable[Long]`
  * [x] `findL(p: A => Boolean): Task[Option[A]]`
  * [ ] `foldL[AA >: A](implicit A: Monoid[AA]): Task[AA]`
  * [ ] `foldF[AA >: A](implicit A: Monoid[AA]): Observable[AA]`
  * [ ] `foldWhileLeftL[S](seed: => S)(op: (S, A) => Either[S, S]): Task[S]`
  * [ ] `foldWhileLeftF[S](seed: => S)(op: (S, A) => Either[S, S]): Observable[S]`
  * [x] `headL: Task[A] = firstL`
  * [x] `firstL: Task[A]`
  * [x] `firstOrElseL[B >: A](default: => B): Task[B]`
  * [ ] `forAllL(p: A => Boolean): Task[Boolean]`
  * [x] `existsL(p: A => Boolean): Task[Boolean]`
  * [x] `findF(p: A => Boolean): Observable[A]`
  * [x] `filter(p: A => Boolean): Observable[A]`
  * [x] `headF: Observable[A] = take(1)`
  * [x] `take(n: Long): Observable[A]`
  * [x] `foldLeftL[R](seed: => R)(op: (R, A) => R): Task[R]`
  * [x] `foldLeftF[R](seed: => R)(op: (R, A) => R): Observable[R]`
  * [-] `headOrElseL[B >: A](default: => B): Task[B] = firstOrElseL(default)`
  * [x] `lastL: Task[A]`
  * [ ] `isEmptyL: Task[Boolean]`
  * [ ] `isEmptyF: Observable[Boolean]`
  * [ ] `completedL: Task[Unit]`
  * [ ] `maxL[AA >: A](implicit A: Order[AA]): Task[Option[AA]]`
  * [ ] `maxF[AA >: A](implicit A: Order[AA]): Observable[AA]`
  * [-] `headOptionL: Task[Option[A]] = firstOptionL`
  * [ ] `firstOptionL: Task[Option[A]]`
  * [ ] `maxByL[K](key: A => K)(implicit K: Order[K]): Task[Option[A]]`
  * [ ] `maxByF[K](key: A => K)(implicit K: Order[K]): Observable[A]`
  * [ ] `minL[AA >: A](implicit A: Order[AA]): Task[Option[AA]]`
  * [ ] `minF[AA >: A](implicit A: Order[AA]): Observable[AA]`
  * [ ] `minByL[K](key: A => K)(implicit K: Order[K]): Task[Option[A]]`
  * [ ] `minByF[K](key: A => K)(implicit K: Order[K]): Observable[A]`
  * [ ] `nonEmptyL: Task[Boolean]`
  * [ ] `nonEmptyF: Observable[Boolean]`
  * [ ] `sumL[B >: A](implicit B: Numeric[B]): Task[B]`
  * [ ] `sumF[AA >: A](implicit A: Numeric[AA]): Observable[AA]`
  * [ ] `toListL: Task[List[A]]`
  * [ ] `foreachL(cb: A => Unit): Task[Unit]`
  * [ ] `foreach(cb: A => Unit)(implicit s: Scheduler): CancelableFuture[Unit]`
  
  
`Observable` builders

  * [ ] `apply[A](elems: A*): Observable[A]`
  * [x] `pure[A](elem: A): Observable[A]` 
  * [ ] `delay[A](a: => A): Observable[A]` 
  * [x] `evalOnce[A](f: => A): Observable[A]` 
  * [x] `now[A](elem: A): Observable[A]` 
  * [ ] `raiseError[A](ex: Throwable): Observable[A]` 
  * [x] `eval[A](a: => A): Observable[A]` 
  * [ ] `evalDelayed[A](delay: FiniteDuration, a: => A): Observable[A]` 
  * [x] `never[A]: Observable[A]` 
  * [ ] `fork[A](fa: Observable[A]): Observable[A]` 
  * [ ] `fork[A](fa: Observable[A], scheduler: Scheduler): Observable[A]` 
  * [ ] `tailRecM[A, B](a: A)(f: (A) => Observable[Either[A, B]]): Observable[B]` 
  * [ ] `unsafeCreate[A](f: Subscriber[A] => Cancelable): Observable[A]` 
  * [x] `create[A](overflowStrategy: OverflowStrategy.Synchronous[A])(f: Subscriber.Sync[A] => Cancelable): Observable[A]` 
  * [ ] `multicast[A](multicast: MulticastStrategy[A])(implicit s: Scheduler): (Observer.Sync[A], Observable[A])` 
  * [ ] `multicast[A](multicast: MulticastStrategy[A], overflow: OverflowStrategy.Synchronous[A])(implicit s: Scheduler): (Observer.Sync[A], Observable[A])` 
  * [ ] `fromIterator[A](iterator: Iterator[A]): Observable[A]` (fromArray) 
  * [ ] `fromIterator[A](iterator: Iterator[A], onFinish: () => Unit): Observable[A]` 
  * [ ] `fromInputStream(in: InputStream): Observable[Array[Byte]]` 
  * [ ] `fromInputStream(in: InputStream, chunkSize: Int): Observable[Array[Byte]]` 
  * [ ] `fromCharsReader(in: Reader): Observable[Array[Char]]` 
  * [ ] `fromCharsReader(in: Reader, chunkSize: Int): Observable[Array[Char]]` 
  * [ ] `fromLinesReader(in: BufferedReader): Observable[String]` 
  * [ ] `fromReactivePublisher[A](publisher: RPublisher[A]): Observable[A]` 
  * [ ] `fromReactivePublisher[A](publisher: RPublisher[A], requestCount: Int): Observable[A]` 
  * [ ] `coeval[A](value: Coeval[A]): Observable[A]` 
  * [ ] `fromEval[A](fa: Eval[A]): Observable[A]` 
  * [ ] `fromFuture[A](factory: => Future[A]): Observable[A]` 
  * [-] `fromEffect[F[_], A](fa: F[A])(implicit F: Effect[F]): Observable[A]` 
  * [ ] `fromIO[A](fa: IO[A]): Observable[A]` 
  * [ ] `fromTask[A](task: Task[A]): Observable[A]` 
  * [ ] `suspend[A](fa: => Observable[A]): Observable[A]` 
  * [ ] `defer[A](fa: => Observable[A]): Observable[A]` 
  * [ ] `cons[A](head: A, tail: Observable[A]): Observable[A]` 
  * [ ] `interleave2[A](oa1: Observable[A], oa2: Observable[A]): Observable[A]` 
  * [ ] `intervalWithFixedDelay(initialDelay: FiniteDuration, delay: FiniteDuration): Observable[Long]` 
  * [ ] `interval(delay: FiniteDuration): Observable[Long]` 
  * [ ] `intervalWithFixedDelay(delay: FiniteDuration): Observable[Long]` 
  * [ ] `intervalAtFixedRate(period: FiniteDuration): Observable[Long]` 
  * [ ] `intervalAtFixedRate(initialDelay: FiniteDuration, period: FiniteDuration): Observable[Long]` 
  * [ ] `repeat[A](elems: A*): Observable[A]` 
  * [ ] `repeatEval[A](task: => A): Observable[A]` 
  * [x] `range(from: Long, until: Long, step: Long = 1L): Observable[Long]` 
  * [ ] `fromStateAction[S, A](f: S => (A, S))(seed: => S): Observable[A]` 
  * [ ] `fromAsyncStateAction[S, A](f: S => Task[(A, S)])(seed: => S): Observable[A]` 
  * [ ] `toReactive[A](source: Observable[A])(implicit s: Scheduler): RPublisher[A]` 
  * [ ] `timerRepeated[A](initialDelay: FiniteDuration, period: FiniteDuration, unit: A): Observable[A]` 
  * [ ] `flatten[A](sources: Observable[A]*): Observable[A]` 
  * [ ] `flattenDelayError[A](sources: Observable[A]*): Observable[A]` 
  * [ ] `merge[A](sources: Observable[A]*)` 
  * [ ] `mergeDelayError[A](sources: Observable[A]*)` 
  * [ ] `fromIterable[A](iterable: Iterable[A]): Observable[A]` 
  * [ ] `concat[A](sources: Observable[A]*): Observable[A]` 
  * [ ] `concatDelayError[A](sources: Observable[A]*): Observable[A]` 
  * [ ] `switch[A](sources: Observable[A]*): Observable[A]` 
  * [ ] `zip2[A1, A2](oa1: Observable[A1], oa2: Observable[A2]): Observable[(A1, A2)]` 
  * [ ] `zipMap2[A1, A2, R](oa1: Observable[A1], oa2: Observable[A2])(f: (A1, A2) => R): Observable[R]` 
  * [ ] `zip3[A1, A2, A3](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3]): Observable[(A1, A2, A3)]` 
  * [ ] `zipMap3[A1, A2, A3, R](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3])` 
  * [ ] `zip4[A1, A2, A3, A4](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3], oa4: Observable[A4]): Observable[(A1, A2, A3, A4)]` 
  * [ ] `zipMap4[A1, A2, A3, A4, R](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3], oa4: Observable[A4])(f: (A1, A2, A3, A4) => R): Observable[R]` 
  * [ ] `zip5[A1, A2, A3, A4, A5](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5]): Observable[(A1, A2, A3, A4, A5)]` 
  * [ ] `zipMap5[A1, A2, A3, A4, A5, R](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5])(f: (A1, A2, A3, A4, A5) => R): Observable[R]` 
  * [ ] `zip6[A1, A2, A3, A4, A5, A6](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5], oa6: Observable[A6]): Observable[(A1, A2, A3, A4, A5, A6)]` 
  * [ ] `zipMap6[A1, A2, A3, A4, A5, A6, R](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5], oa6: Observable[A6])(f: (A1, A2, A3, A4, A5, A6) => R): Observable[R]` 
  * [ ] `zipList[A](sources: Observable[A]*): Observable[Seq[A]]` 
  * [x] `empty[A]: Observable[A]` 
  * [ ] `combineLatest2[A1, A2](oa1: Observable[A1], oa2: Observable[A2]): Observable[(A1, A2)]` 
  * [ ] `combineLatestMap2[A1, A2, R](oa1: Observable[A1], oa2: Observable[A2])(f: (A1, A2) => R): Observable[R]` 
  * [ ] `combineLatest3[A1, A2, A3](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3]): Observable[(A1, A2, A3)]` 
  * [ ] `combineLatestMap3[A1, A2, A3, R](a1: Observable[A1], a2: Observable[A2], a3: Observable[A3])(f: (A1, A2, A3) => R): Observable[R]` 
  * [ ] `combineLatest4[A1, A2, A3, A4](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4]): Observable[(A1, A2, A3, A4)]` 
  * [ ] `combineLatestMap4[A1, A2, A3, A4, R](a1: Observable[A1], a2: Observable[A2], a3: Observable[A3], a4: Observable[A4])(f: (A1, A2, A3, A4) => R): Observable[R]` 
  * [ ] `combineLatest5[A1, A2, A3, A4, A5](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5]): Observable[(A1, A2, A3, A4, A5)]` 
  * [ ] `combineLatestMap5[A1, A2, A3, A4, A5, R](a1: Observable[A1], a2: Observable[A2], a3: Observable[A3], a4: Observable[A4], a5: Observable[A5])(f: (A1, A2, A3, A4, A5) => R): Observable[R]` 
  * [ ] `combineLatest6[A1, A2, A3, A4, A5, A6](oa1: Observable[A1], oa2: Observable[A2], oa3: Observable[A3],oa4: Observable[A4], oa5: Observable[A5], oa6: Observable[A6]): Observable[(A1, A2, A3, A4, A5, A6)]` 
  * [ ] `combineLatestMap6[A1, A2, A3, A4, A5, A6, R](a1: Observable[A1], a2: Observable[A2], a3: Observable[A3],a4: Observable[A4], a5: Observable[A5], a6: Observable[A6])(f: (A1, A2, A3, A4, A5, A6) => R): Observable[R]` 
  * [ ] `combineLatestList[A](sources: Observable[A]*): Observable[Seq[A]]` 
  * [ ] `firstStartedOf[A](source: Observable[A]*): Observable[A]` 

`Observable` consumer methods

  * [x] `def subscribe(observer: Observer[A])(implicit s: Scheduler): Cancelable` (`subscribeWith`)
  * [x] `subscribe(nextFn: A => Future[Ack], errorFn: Throwable => Unit, completedFn: () => Unit)`
  
  
## Notes

For synchronous sources, in order to use `takeUntil` and `onErrorRestart` - need to add 
_asyncBoundary_ (ex: bufferWithPressure), otherwise event loop may never reach `takeUntil`

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
