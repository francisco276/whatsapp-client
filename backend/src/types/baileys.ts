import type { BaileysEventMap } from 'baileys'

export type BaileysEventHandler<T extends keyof BaileysEventMap> = (args: BaileysEventMap[T]) => void
