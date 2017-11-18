import ObservableInstance from "../ObservableInstance";
import Observable from "../../Observable";
import {Cancelable, Operator, Subscriber} from "../../Reactive";

export default class LiftByOperatorObservable<A, B> extends ObservableInstance<B> {
  private readonly _self: Observable<A>;
  private readonly _operator: Operator<A, B>;

  constructor(self: Observable<A>, operator: Operator<A, B>) {
    super();
    this._self = self;
    this._operator = operator;
  }

  unsafeSubscribeFn(subscriber: Subscriber<B>): Cancelable {
    const sb = this._operator(subscriber);
    return this._self.unsafeSubscribeFn(sb);
  }
}
