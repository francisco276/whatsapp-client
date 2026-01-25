import { type FastifyInstance } from 'fastify'
import { sessionAccess } from '@/controllers'

export default function defineRoutes(fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.post('/get', sessionAccess.get)
  fastify.post('/', sessionAccess.find)
  fastify.put('/', sessionAccess.update)
  done()
}
