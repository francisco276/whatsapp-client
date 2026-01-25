import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { templatesTable } from '@/db/schema'
import { db } from '@/db'
import * as Schema from '@/schemas/templates'
import { FromSchema } from 'json-schema-to-ts'
import { eq } from 'drizzle-orm'

export const list = async (req: FastifyRequest<{ Body: FromSchema<typeof Schema.list> }>, res: FastifyReply): Promise<void> => {
  try {
    const { body: { workspaceId } } = req
    const templates = await db
      .select()
      .from(templatesTable)
      .where(
        eq(templatesTable.workspaceId, workspaceId)
      )

    await sendSuccessResponse(res, { templates })
  } catch (error) {
    await handleError(error, res)
  }
}

export const find = async (req: FastifyRequest<{ Params: FromSchema<typeof Schema.find> }>, res: FastifyReply): Promise<void> => {
  try {
    const { params: { templateId } } = req
    const templates = await db
      .select()
      .from(templatesTable)
      .where(eq(templatesTable.id, Number(templateId)))
      .limit(1)

    await sendSuccessResponse(res, { templates })
  } catch (error) {
    await handleError(error, res)
  }
}

export const add = async (req: FastifyRequest<{ Body: FromSchema<typeof Schema.add> }>, res: FastifyReply): Promise<void> => {
  const { user: { userId }, body } = req
  const { description, message, name, workspaceId } = body

  try {
    const templates = await db
      .insert(templatesTable)
      .values({
        name,
        description,
        message,
        workspaceId,
        active: true,
        createdBy: userId,
        updatedBy: userId
      })
      .returning()
    await sendSuccessResponse(res, { templates }, 'Template created successfully', 201)
  } catch (error) {
    await handleError(error, res)
  }
}

export const update = async (req: FastifyRequest<{ Body: FromSchema<typeof Schema.update> }>, res: FastifyReply): Promise<void> => {
  const { user: { userId }, body } = req
  const {
    templateId,
    name,
    description,
    message,
    active
  } = body
  try {
    const templates = await db
      .update(templatesTable)
      .set({
        name,
        description,
        message,
        active,
        updatedBy: userId
      })
      .where(
        eq(templatesTable.id, Number(templateId))
      )
      .returning()
    await sendSuccessResponse(res, { templates }, 'Template updated successfully', 201)
  } catch (error) {
    await handleError(error, res)
  }
}

export const remove = async (req: FastifyRequest<{ Params: FromSchema<typeof Schema.find> }>, res: FastifyReply): Promise<void> => {
  try {
    const { params: { templateId } } = req

    const templates = await db
      .delete(templatesTable)
      .where(
        eq(templatesTable.id, Number(templateId))
      )
      .returning()

    await sendSuccessResponse(res, { templates })
  } catch (error) {
    await handleError(error, res)
  }
}
