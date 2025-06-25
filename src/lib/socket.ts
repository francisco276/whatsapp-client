import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { SocketSuccessResponse, SocketErrorResponse } from '../types/socket'

const URL: string | undefined = import.meta.env.VITE_SOCKET_API ?? undefined
const API_KEY: string | undefined = import.meta.env.VITE_API_KEY ?? undefined

export class SocketClient {
  private readonly socket: Socket

  constructor({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) {
    this.socket = io(URL, {
      path: '/socket.io',
      autoConnect: true,
      auth: {
        token: API_KEY
      },
      query: {
        workspaceId,
        sessionId
      },
      multiplex: false
    })
  }

  on(event: string, callback: (data: SocketSuccessResponse | SocketErrorResponse) => void | Promise<void>) {
    return this.socket.on(event, callback)
  }

  disconnect() {
    this.socket.disconnect()
  }
}
