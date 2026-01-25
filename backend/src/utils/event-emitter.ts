import type { SocketServer } from '@/server/websocket-server'
import type { EventsType } from '@/types/websockets'

let socketServer: SocketServer | null = null
export function initializeSocketEmitter (server: SocketServer): void {
  socketServer = server
}

export function emitEvent (
  event: EventsType,
  clientId: string,
  data?: unknown,
  status: 'success' | 'error' = 'success',
  message?: string
): void {
  if (socketServer === null) {
    console.error('Socket server not initialized. Call initializeSocketEmitter first.')
    return
  }
  socketServer.emitEvent(event, clientId, { status, message, data })
}
