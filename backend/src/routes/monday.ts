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

  fastify.post(
    '/upload-files',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            workspaceId: { type: 'string' },
            sessionId: { type: 'string' },
            itemId: { type: 'string' },
            columnId: { type: 'string' },
            messageIds: { type: 'array', items: { type: 'number' } }
          },
          required: ['workspaceId', 'sessionId', 'itemId', 'columnId', 'messageIds']
        }
      }
    },
    monday.uploadFiles
  )

  done()
}
