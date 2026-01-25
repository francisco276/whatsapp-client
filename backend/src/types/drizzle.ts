/* eslint-disable @typescript-eslint/no-explicit-any */
import Long from 'long'

// Types
type TransformDrizzle<T, TransformObject> = T extends Long
  ? number
  : T extends Uint8Array
    ? Buffer
    : T extends bigint
      ? number
      : T extends null
        ? never
        : T extends object
          ? TransformObject extends true
            ? object
            : T
          : T

export type MakeTransformedDrizzle<
  T extends Record<string, any>,
  TransformObject extends boolean = true,
> = {
  [K in keyof T]: TransformDrizzle<T[K], TransformObject>;
}

type SerializeDrizzle<T> = T extends Buffer
  ? {
      type: 'Buffer'
      data: number[]
    }
  : T extends bigint
    ? string
    : T extends null
      ? never
      : T

export type MakeSerializedDrizzle<T extends Record<string, any>> = {
  [K in keyof T]: SerializeDrizzle<T[K]>;
}
