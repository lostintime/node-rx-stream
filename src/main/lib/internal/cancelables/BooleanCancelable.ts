import {Cancelable} from "../../Reactive";


export interface IBooleanCancelable extends Cancelable {
  isCanceled(): boolean;
}

export class BooleanCancelableImpl implements IBooleanCancelable {
  private _isCancelled: boolean = false;

  isCanceled(): boolean {
    return this._isCancelled;
  }

  cancel(): void {
    this._isCancelled = true;
  }
}

export default function BooleanCancelable(): IBooleanCancelable {
  return new BooleanCancelableImpl();
}
