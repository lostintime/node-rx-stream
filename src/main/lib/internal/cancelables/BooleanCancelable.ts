import {Cancelable} from "../../Reactive";

// FIXME make me interface
export default class BooleanCancelable implements Cancelable {
  private _isCancelled: boolean = false;

  isCanceled(): boolean {
    return this._isCancelled;
  }

  cancel(): void {
    this._isCancelled = true;
  }
}
