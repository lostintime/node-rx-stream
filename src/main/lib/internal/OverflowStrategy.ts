import {Option} from 'funfix';


export namespace OverflowStrategy {
  function require(expr: boolean, message: string): void {
    if (!expr) {
      throw new Error(message);
    }
  }

  export namespace Type {
    
    export interface Unbounded {
      readonly _tag: 'Unbounded'
      readonly isEvicted: boolean
      readonly isSynchronous: true
    }

    export class Fail {
      readonly _tag = 'Fail';
      readonly isEvicted: boolean = false;
      readonly isSynchronous: true = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class BackPressure {
      readonly _tag = 'BackPressure';
      readonly isEvicted: boolean = false;
      readonly isSynchronous: boolean = false;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropNew {
      readonly _tag = 'DropNew';
      readonly isEvicted: true = true;
      readonly isSynchronous: true = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropNewAndSignal<A> {
      readonly _tag = 'DropNewAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropOld {
      readonly _tag = 'DropOld';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class DropOldAndSignal<A> {
      readonly _tag = 'DropOldAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class ClearBuffer {
      readonly _tag = 'ClearBuffer';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }

    export class ClearBufferAndSignal<A> {
      readonly _tag = 'ClearBufferAndSignal';
      readonly isEvicted = true;
      readonly isSynchronous = true;

      constructor(readonly bufferSize: number,
                  readonly onOverflow: (n: number) => Option<A>) {
        require(bufferSize < 1, 'bufferSize should be strictly greater than 1');
      }
    }
  }

  export type Evicted<A> =
    Type.DropNew
    | Type.DropNewAndSignal<A>
    | Type.DropOld
    | Type.DropOldAndSignal<A>
    | Type.ClearBuffer
    | Type.ClearBufferAndSignal<A>;

  export type Synchronous<A> = Type.Unbounded | Type.Fail | Evicted<A>

  const Unbounded: Type.Unbounded = {
    _tag: 'Unbounded',
    isEvicted: false,
    isSynchronous: true
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

export type OverflowStrategy<A> = OverflowStrategy.Synchronous<A> | OverflowStrategy.Type.BackPressure;
