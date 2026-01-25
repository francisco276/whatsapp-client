import { type FastifyInstance } from 'fastify'
import { sessions } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.get('/:workspaceId', sessions.list)
  fastify.get('/:workspaceId/:sessionId', sessions.find)
  fastify.post('/add', sessions.add)
  fastify.delete('/', sessions.del)
  done()
}
