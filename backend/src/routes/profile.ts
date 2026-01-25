import { type FastifyInstance } from 'fastify'
import { profile } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.get('/:workspaceId/:sessionId', profile.find)
  done()
}
