import { type FastifyInstance } from 'fastify'
import { workspaces } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.get('/:workspaceId', workspaces.find)
  fastify.post('/add', workspaces.add)
  fastify.post('/join', workspaces.join)
  fastify.delete('/:workspaceId', workspaces.del)
  done()
}
