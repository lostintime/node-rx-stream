import {Cancelable} from "../../Reactive";
import BooleanCancelable from "./BooleanCancelable";

export interface AssignableCancelable extends Cancelable {
  assign(value: Cancelable): this
}


export namespace AssignableCancelable {
  export abstract class Bool extends BooleanCancelable implements AssignableCancelable {
    abstract assign(value: Cancelable): this;
  }

  export abstract class Multi extends Bool {
    abstract orderedUpdate(value: Cancelable, order: number): this;
  }
}
