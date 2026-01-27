import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'
import type { SocketSuccessResponse, SocketErrorResponse } from '../types/socket'

const FALLBACK_URL = 'https://wa.appssimplifica.dev'
const URL: string = import.meta.env.VITE_SOCKET_API || FALLBACK_URL
const API_KEY: string | undefined = import.meta.env.VITE_API_KEY ?? undefined

export class SocketClient {
  private readonly socket: Socket

  constructor({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) {
    console.log('[Socket] Connecting to:', URL, 'workspaceId:', workspaceId, 'sessionId:', sessionId)
    this.socket = io(URL, {
      path: '/wa/socket.io',
      autoConnect: true,
      auth: {
        token: API_KEY
      },
      query: {
        workspaceId,
        sessionId
      },
      multiplex: false,
      transports: ['websocket', 'polling']
    })

    this.socket.on('connect', () => {
      console.log('[Socket] Connected successfully, socket id:', this.socket.id)
    })

    this.socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message)
    })

    this.socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason)
    })
  }

  on(event: string, callback: (data: SocketSuccessResponse | SocketErrorResponse) => void | Promise<void>) {
    return this.socket.on(event, callback)
  }

  onConnect(callback: () => void) {
    this.socket.on('connect', callback)
  }

  onDisconnect(callback: () => void) {
    this.socket.on('disconnect', callback)
  }

  isConnected() {
    return this.socket.connected
  }

  disconnect() {
    this.socket.disconnect()
  }
}
