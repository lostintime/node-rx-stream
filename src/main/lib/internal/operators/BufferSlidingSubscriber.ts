import {Ack, Continue, Stop, Subscriber} from "../../Reactive";
import {Scheduler, Throwable} from 'funfix';


export default class BufferSlidingSubscriber<A> implements Subscriber<A> {
  private _isDone: boolean = false;
  private _ack: Ack | null = null;
  private readonly _toDrop: number;
  private readonly _toRepeat: number;
  private _buffer: Array<A> = [];
  private _dropped: number = 0;

  constructor(private readonly _count: number,
              private readonly _skip: number,
              private readonly _out: Subscriber<A[]>,
              readonly scheduler: Scheduler = _out.scheduler) {
    if (_count <= 0) {
      throw new Error('Invalid "count" parameter: non-zero positive integer expected');
    }

    if (_skip <= 0) {
      throw new Error('Invalid "skip" parameter: non-zero positive integer expected');
    }

    this._toDrop = _count > _skip ? 0 : (_skip - _count);
    this._toRepeat = _skip > _count ? 0 : (_count - _skip);
  }

  onNext(elem: A): Ack {
    if (this._isDone) {
      return Stop;
    } else if (this._dropped > 0) {
      this._dropped -= 1;

      return Continue;
    } else {
      this._buffer.push(elem);

      if (this._buffer.length < this._count) {
        // buffer not full
        return Continue;
      } else {
        // buffer is full
        const oldBuffer = this._buffer;

        if (this._toRepeat > 0) {
          this._buffer = oldBuffer.slice(this._count - this._toRepeat, this._count);
        } else {
          this._dropped = this._toDrop;
          this._buffer = [];
        }

        // signaling downstream
        this._ack = this._out.onNext(oldBuffer);
        return this._ack;
      }
    }
  }

  onComplete(): void {
    if (!this._isDone) {
      this._isDone = true;

      const threshold = this._ack === null ? 0 : this._toRepeat;
      if (this._buffer.length > threshold) {
        if (this._ack === null) {
          this._ack = Continue;
        }

        Ack.syncOnContinue(this._ack, () => {
          this._out.onNext(this._buffer);
          this._out.onComplete();
          this._buffer = [];
        })
      } else {
        this._out.onComplete();
      }
    }
  }

  onError(e: Throwable): void {
    if (!this._isDone) {
      this._isDone = true;
      this._buffer = [];
      this._out.onError(e);
    }
  }
}
