import { type FastifyInstance } from 'fastify'
import { chats } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.get('/', chats.list)
  fastify.post('/read', chats.read)
  done()
}
