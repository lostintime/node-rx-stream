import {Cancelable} from "../../Reactive";
import {IBooleanCancelable} from "./BooleanCancelable";

export interface AssignableCancelable extends Cancelable {
  assign(value: Cancelable): this
}


export namespace AssignableCancelable {
  export interface Bool extends AssignableCancelable, IBooleanCancelable {
  }

  export interface Multi extends Bool {
    orderedUpdate(value: Cancelable, order: number): this;
  }
}
