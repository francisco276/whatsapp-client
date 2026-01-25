import { type FastifyInstance } from 'fastify'
import { messages } from '@/controllers'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.get('/', messages.list)
  fastify.get('/list/:jid', messages.listByJid)
  fastify.post('/send', messages.send)
  fastify.post('/send/bulk', messages.sendBulk)
  fastify.delete('/delete', messages.deleteMessage)
  fastify.delete('/delete/onlyme', messages.deleteMessage)
  fastify.post('/download', messages.download)
  fastify.post('/markAsRead', messages.read)
  done()
}
