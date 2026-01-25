import { type FastifyInstance } from 'fastify'
import { contacts } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.get('/', contacts.list)
  fastify.post('/', contacts.find)
  fastify.post('/valid', contacts.valid)
  done()
}
