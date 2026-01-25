import { type FastifyInstance } from 'fastify'
import { templates } from '@/controllers'
import { find, add, update, list } from '@/schemas/templates'
import { FromSchema } from 'json-schema-to-ts'

export default function defineRoutes (fastify: FastifyInstance, _: any, done: Function): void {
  fastify.addHook('onRequest', fastify.authenticate)
  fastify.get<{ Params: FromSchema<typeof find> }>('/:templateId', { schema: { params: find } }, templates.find)
  fastify.post<{ Body: FromSchema<typeof list> }>('/', { schema: { body: list } }, templates.list)
  fastify.post<{ Body: FromSchema<typeof add> }>('/add', { schema: { body: add } }, templates.add)
  fastify.put<{ Body: FromSchema<typeof update> }>('/', { schema: { body: update } }, templates.update)
  fastify.delete<{ Params: FromSchema<typeof find> }>('/:templateId', { schema: { params: find } }, templates.remove)
  done()
}
