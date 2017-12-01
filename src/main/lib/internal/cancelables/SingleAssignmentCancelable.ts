import {AssignableCancelable} from "./AssignableCancelable";
import {Cancelable} from "../../Reactive";

export default class SingleAssignmentCancelable implements AssignableCancelable.Bool {
  private _state: State = State.Empty;

  constructor(private readonly _extra: Cancelable | null = null) {
  }

  isCanceled(): boolean {
    switch (this._state._tag) {
      case 'IsEmptyCanceled':
        return true;
      case 'IsCanceled':
        return true;
      case 'Empty':
        return false;
      case 'IsActive':
        return false;
    }
  }

  assign(value: Cancelable): this {
    const oldState = this._state;
    this._state = State.IsActive(value);
    switch (oldState._tag) {
      case 'Empty':
        return this;
      case 'IsEmptyCanceled':
        value.cancel();
        return this;
      case 'IsCanceled':
        value.cancel();
        return SingleAssignmentCancelable.raiseError();
      case 'IsActive':
        value.cancel();
        return SingleAssignmentCancelable.raiseError();
    }
  }

  cancel(): void {
    switch (this._state._tag) {
      case 'IsCanceled':
        // pass
        break;
      case 'IsEmptyCanceled':
        // pass
        break;
      case 'IsActive':
        const s = this._state.s;
        this._state = State.IsCanceled;
        if (this._extra !== null) {
          this._extra.cancel();
        }
        s.cancel();
        break;
      case 'Empty':
        this._state = State.IsEmptyCanceled;
        if (this._extra !== null) {
          this._extra.cancel();
        }
        break;
    }
  }

  private static raiseError(): never {
    throw new Error('Cannot assign to SingleAssignmentCancelable, as it was already assigned once');
  }

  static plusOne(guest: Cancelable): SingleAssignmentCancelable {
    return new SingleAssignmentCancelable(guest);
  }
}

namespace State {
  export namespace Type {
    export type Empty = {
      readonly _tag: 'Empty'
    }

    export class IsActive {
      readonly _tag: 'IsActive';

      constructor(readonly s: Cancelable) {
      }
    }

    export type IsCanceled = {
      readonly _tag: 'IsCanceled';
    }

    export type IsEmptyCanceled = {
      readonly _tag: 'IsEmptyCanceled';
    }
  }

  export const Empty: Type.Empty = {
    _tag: 'Empty'
  };

  export function IsActive(s: Cancelable): Type.IsActive {
    return new Type.IsActive(s);
  }

  export const IsCanceled: Type.IsCanceled = {
    _tag: 'IsCanceled'
  };

  export const IsEmptyCanceled: Type.IsEmptyCanceled = {
    _tag: 'IsEmptyCanceled'
  }
}

type State = State.Type.Empty | State.Type.IsActive | State.Type.IsCanceled | State.Type.IsEmptyCanceled;
