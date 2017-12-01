import {AssignableCancelable} from "./AssignableCancelable";
import {Cancelable} from "../../Reactive";
import EmptyCancelable from "./EmptyCancelable";


export default class MultiAssignmentCancelable implements AssignableCancelable.Multi {
  private _state: State;

  constructor(initial: Cancelable | null = null) {
    this._state = State.Active(initial || EmptyCancelable, 0);
  }

  isCanceled(): boolean {
    switch (this._state._tag) {
      case 'Canceled':
        return true;
      case 'Active':
        return false;
    }
  }

  cancel(): void {
    const oldState = this._state;
    this._state = State.Canceled;

    switch (oldState._tag) {
      case 'Active':
        oldState.s.cancel();
        break;
    }
  }

  private currentOrder(): number {
    switch (this._state._tag) {
      case 'Canceled':
        return 0;
      case 'Active':
        return this._state.order;
    }
  }

  assign(value: Cancelable): this {
    switch (this._state._tag) {
      case 'Canceled':
        value.cancel();
        return this;
      case 'Active':
        this._state = State.Active(value, this._state.order);
        return this;
    }
  }

  orderedUpdate(value: Cancelable, order: number): this {
    switch (this._state._tag) {
      case 'Canceled':
        value.cancel();
        return this;
      case 'Active':
        const currentOrder = this.currentOrder();
        const sameSign = (currentOrder < 0) !== (order >= 0);
        const isOrdered = (sameSign && currentOrder <= order) || (currentOrder >= 0 && order < 0);
        if (isOrdered) {
          this._state = State.Active(value, order);
        }
        return this;
    }
  }
}

namespace State {
  export namespace Type {
    export type Canceled = {
      readonly _tag: 'Canceled'
    }

    export class Active {
      readonly _tag: 'Active';

      constructor(readonly s: Cancelable,
                  readonly order: number) {
      }
    }
  }

  export const Canceled: Type.Canceled = {
    _tag: 'Canceled'
  };

  export function Active(s: Cancelable, order: number): Type.Active {
    return new Type.Active(s, order);
  }
}

export type State = State.Type.Canceled | State.Type.Active;
