import {Cancelable} from "../../Reactive";

export default class EmptyCancelable implements Cancelable {
  cancel(): void {
  }
}
