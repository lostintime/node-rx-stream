import {Option} from 'funfix';

export namespace OverflowStrategy {
  function require(expr: boolean, message: string): void {
    if (!expr) {
      throw new Error(message);
    }
  }

  export namespace Type {
    interface BaseOverflowStrategy {
      readonly isEvicted: boolean
      readonly isSynchronous: boolean
    }

    export interface Unbounded extends BaseOverflowStrategy {
      readonly _tag: 'Unbounded';
    }

    export class Fail implements BaseOverflowStrategy {
      readonly _tag = 'Fail';
      readonly isEvicted = false;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class BackPressure implements BaseOverflowStrategy {
      readonly _tag = 'BackPressure';
      readonly isEvicted = false;
      readonly isSynchronous = false;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropNew implements BaseOverflowStrategy {
      readonly _tag = 'DropNew';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropNewAndSignal<A> implements BaseOverflowStrategy {
      readonly _tag = 'DropNewAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropOld implements BaseOverflowStrategy {
      readonly _tag = 'DropOld';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropOldAndSignal<A> implements BaseOverflowStrategy {
      readonly _tag = 'DropOldAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class ClearBuffer implements BaseOverflowStrategy {
      readonly _tag = 'ClearBuffer';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class ClearBufferAndSignal<A> implements BaseOverflowStrategy {
      readonly _tag = 'ClearBufferAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }
  }

  const Unbounded: Type.Unbounded = {
    _tag: 'Unbounded',
    isEvicted: false,
    isSynchronous: false
  };

  export function Fail(bufferSize: number): Type.Fail {
    return new Type.Fail(bufferSize);
  }

  export function BackPressure(bufferSize: number): Type.BackPressure {
    return new Type.BackPressure(bufferSize);
  }

  export function DropNew(bufferSize: number): Type.DropNew {
    return new Type.DropNew(bufferSize);
  }

  export function DropNewAndSignal<A>(bufferSize: number, onOverflow: (n: number) => Option<A>): Type.DropNewAndSignal<A> {
    return new Type.DropNewAndSignal(bufferSize, onOverflow);
  }

  export function DropOld(bufferSize: number): Type.DropOld {
    return new Type.DropOld(bufferSize);
  }

  export function DropOldAndSignal<A>(bufferSize: number, onOverflow: (n: number) => Option<A>): Type.DropOldAndSignal<A> {
    return new Type.DropOldAndSignal(bufferSize, onOverflow);
  }

  export function ClearBuffer(bufferSize: number): Type.ClearBuffer {
    return new Type.ClearBuffer(bufferSize);
  }

  export function ClearBufferAndSignal<A>(bufferSize: number, onOverflow: (n: number) => Option<A>): Type.ClearBufferAndSignal<A> {
    return new Type.ClearBufferAndSignal(bufferSize, onOverflow);
  }
}

export type OverflowStrategy<A> = OverflowStrategy.Type.Unbounded
  | OverflowStrategy.Type.BackPressure
  | OverflowStrategy.Type.DropNew
  | OverflowStrategy.Type.DropNewAndSignal<A>
  | OverflowStrategy.Type.DropOld
  | OverflowStrategy.Type.DropOldAndSignal<A>
  | OverflowStrategy.Type.ClearBuffer
  | OverflowStrategy.Type.ClearBufferAndSignal<A>;
