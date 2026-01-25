/* eslint-disable @typescript-eslint/no-dynamic-delete */
import { toNumber } from 'baileys'
import Long from 'long'
import type { MakeTransformedDrizzle, MakeSerializedDrizzle } from '@/types/drizzle'

export function transformDrizzle<T extends Record<string, any>> (
  data: T,
  removeNullable = true
): MakeTransformedDrizzle<T> {
  const obj = { ...data } as any

  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Uint8Array) {
      obj[key] = Buffer.from(val)
    } else if (typeof val === 'number' || val instanceof Long) {
      obj[key] = toNumber(val)
    } else if (typeof val === 'bigint') {
      obj[key] = Number(val)
    } else if (removeNullable && (typeof val === 'undefined' || val === null)) {
      delete obj[key]
    }
  }

  return obj
}

/** Transform drizzle result into JSON serializable types */
export function serializeDrizzle<T extends Record<string, any>> (
  data: T,
  removeNullable = true
): MakeSerializedDrizzle<T> {
  const obj = { ...data } as any

  for (const [key, val] of Object.entries(obj)) {
    if (val instanceof Buffer) {
      obj[key] = val.toJSON()
    } else if (typeof val === 'bigint') {
      obj[key] = val.toString()
    } else if (removeNullable && (typeof val === 'undefined' || val === null)) {
      delete obj[key]
    }
  }

  return obj
}
