import './config'
import app from './app'
import env from './const/env'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import http from 'http'
import { SocketServer } from '@/server/websocket-server'
import { initializeSocketEmitter } from '@/utils/event-emitter'

const start = async (): Promise<void> => {
  try {
    const manager = new WorkspaceManager()

    // Wait until fastify is ready
    await app.ready()

    // Create the HTTP server with Fastify
    const server = http.createServer((req, res) => {
      app.server.emit('request', req, res)
    })

    const socketServer = new SocketServer(server)
    initializeSocketEmitter(socketServer)

    server.listen(env.PORT, '0.0.0.0', () => { })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start().catch((err) => {
  console.error(err)
  process.exit(1)
})
