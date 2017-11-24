import {Cancelable} from "../../Reactive";

// TODO make it an object
export default class EmptyCancelable implements Cancelable {
  cancel(): void {
  }
}
