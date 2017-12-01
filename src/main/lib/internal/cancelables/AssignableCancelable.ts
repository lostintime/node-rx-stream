import {Cancelable} from "../../Reactive";
import {IBoolCancelable} from 'funfix';

export interface AssignableCancelable extends Cancelable {
  assign(value: Cancelable): this
}


export namespace AssignableCancelable {
  export interface Bool extends AssignableCancelable, IBoolCancelable {
  }

  export interface Multi extends Bool {
    orderedUpdate(value: Cancelable, order: number): this;
  }
}
