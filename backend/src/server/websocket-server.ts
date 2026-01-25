import { type EventsType } from '@/types/websockets'
import { Server as SocketIOServer } from 'socket.io'
import type http from 'http'
import ENV from '@/const/env'

interface SocketData {
  workspaceId: string
  sessionId: string
}

export class SocketServer {
  private readonly io: SocketIOServer
  private readonly clients: Map<string, Set<string>> = new Map()

  constructor (httpServer: http.Server) {
    this.io = new SocketIOServer(httpServer, {
      path: '/socket.io/',
      cors: {
        origin: '*',
        methods: ['GET', 'POST']
      }
    })
    this.setupConnectionHandler()
  }

  private setupConnectionHandler (): void {
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token !== undefined
        ? socket.handshake.auth.token
        : socket.handshake.headers.token

      if (typeof token !== 'string' || token !== ENV.API_KEY) {
        return next(new Error('Invalid API key'))
      }
      next()
    })

    this.io.on('connection', async (socket) => {
      const { sessionId, workspaceId } = socket.handshake.query as unknown as SocketData

      const isValidSession = typeof sessionId === 'string'
      const isValidWorkspace = typeof workspaceId === 'string'

      if (!isValidSession || !isValidWorkspace) {
        socket.disconnect(true)
        return
      }

      const clientId = `${workspaceId}-${sessionId}`

      this.addClient(clientId, socket.id)
      await socket.join(clientId)

      socket.emit('connected', { clientId })

      socket.on('disconnect', () => {
        this.removeClient(clientId, socket.id)
      })
    })
  }

  private addClient (clientId: string, socketId: string): void {
    if (!this.clients.has(clientId)) {
      this.clients.set(clientId, new Set())
    }
    const client = this.clients.get(clientId)

    if (client !== undefined) {
      client.add(socketId)
      return
    }
    throw new Error('Client not found in the map')
  }

  private removeClient (clientId: string, socketId: string): void {
    const clientSet = this.clients.get(clientId)
    if (clientSet !== undefined) {
      clientSet.delete(socketId)
      if (clientSet.size === 0) {
        this.clients.delete(clientId)
      }
    }
  }

  public emitEvent (event: EventsType, clientId: string, data: unknown): void {
    this.io.to(clientId).emit(event, { event, clientId, data })
  }

  public getConnectedClients (clientId: string): number {
    return this.clients.get(clientId)?.size ?? 0
  }
}
