import { type FastifyInstance } from 'fastify'
import { preferences, authorization } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.post('/', preferences.get)
  fastify.post('/update', preferences.update)
  fastify.post('/auth/get', authorization.get)
  fastify.post('/auth', authorization.update)
  fastify.post('/auth/verify', authorization.find)
  done()
}
