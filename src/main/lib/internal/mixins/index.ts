import Observable from "../../Observable";
import {Cancelable, Operator, Subscriber} from "../../Reactive";
import LiftByOperatorObservable from "../operators/LiftByOperatorObservable";


export abstract class OperatorsMixin<A> {
  abstract unsafeSubscribeFn(subscriber: Subscriber<A>): Cancelable;

  abstract subscribe(subscriber: Subscriber<A>): Cancelable;

  liftByOperator<B>(operator: Operator<A,B>): Observable<B> {
    return new LiftByOperatorObservable(this, operator);
  }
}
