import { type FastifyInstance } from 'fastify'
import { messageCounters } from '@/controllers'

export default function defineRoutes(fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.get('/:workspaceId', messageCounters.get)
  fastify.post('/:workspaceId/increment', messageCounters.increment)
  done()
}
