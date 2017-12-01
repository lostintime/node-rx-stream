import ObservableInstance from "../ObservableInstance";
import {Operator, Subscriber} from "../../Reactive";
import {Cancelable} from 'funfix';

export default class LiftByOperatorObservable<A, B> extends ObservableInstance<B> {

  constructor(private readonly _self: ObservableInstance<A>,
              private readonly _operator: Operator<A, B>) {
    super();
  }

  unsafeSubscribeFn(subscriber: Subscriber<B>): Cancelable {
    const sb = this._operator(subscriber);
    return this._self.unsafeSubscribeFn(sb);
  }
}
