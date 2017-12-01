import {Cancelable} from "../../Reactive";

const EmptyCancelable: Cancelable = new (class EmptyCancelableImpl implements Cancelable {
  cancel(): void {
  }
})();

export default EmptyCancelable;
