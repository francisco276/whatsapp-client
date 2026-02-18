import { type FastifyInstance } from 'fastify'
import { monday } from '@/controllers'

export default function MondayRouter (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)

  fastify.post(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string' },
            userId: { type: 'string' },
            boardId: { type: 'string' },
            mondayToken: { type: 'string' }
          },
          required: ['workspaceId', 'userId', 'boardId']
        }
      }
    },
    monday.register
  )
  done()
}
