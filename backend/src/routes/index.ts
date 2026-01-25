/* eslint-disable @typescript-eslint/no-floating-promises */
import { type FastifyInstance } from 'fastify'
import WorksapcesRouter from './workspaces'
import SessionsRouter from './sessions'
import ProfileRouter from './profile'
import ChatsRouter from './chats'
import ContactRouter from './contacts'
import MessagesRouter from './messages'
import PreferencesRouter from './preferences'
import SessionAccess from './session-access'
import TemplatesRoutes from './templates'
import Auth from '@/plugins/auth'
import { sessionValidationPlugin } from '@/plugins/session-validation'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.register(Auth)
  fastify.register(WorksapcesRouter, { prefix: '/workspaces' })
  fastify.register(SessionsRouter, { prefix: '/sessions' })
  fastify.register(ProfileRouter, { prefix: '/profile' })
  fastify.register(PreferencesRouter, { prefix: '/preferences' })
  fastify.register(SessionAccess, { prefix: '/access' })
  fastify.register(TemplatesRoutes, { prefix: '/templates' })

  fastify.register((instance, _, scopeDone) => {
    instance.addHook('preHandler', sessionValidationPlugin)
    instance.addHook('onRequest', fastify.authenticate)
    fastify.register(ChatsRouter, { prefix: '/:workspaceId/:sessionId/chats' })
    instance.register(ContactRouter, { prefix: '/:workspaceId/:sessionId/contacts' })
    instance.register(MessagesRouter, { prefix: '/:workspaceId/:sessionId/messages' })
    scopeDone()
  })
  done()
}
