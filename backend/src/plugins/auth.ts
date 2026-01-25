import { type FastifyInstance } from 'fastify'
import { auth } from '@/controllers'
import fp from 'fastify-plugin'

function defineRoutes (fastify: FastifyInstance, _: any): void {
  fastify.post(
    '/',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            accountId: {
              type: 'string'
            },
            userId: {
              type: 'string'
            }
          },
          required: ['accountId', 'userId']
        }
      }
    }, auth.get
  )

  fastify.decorate('authenticate', auth.validate)
}

export default fp(defineRoutes, { name: 'auth-plugin' })

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
