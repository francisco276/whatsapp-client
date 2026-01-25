import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '@/db'
import { sessionAccessTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { validateSessionBody, validateUserIdBody } from '@/validations/body'

interface GetAuthorizationBody {
  workspaceId: string
  sessionId: string
}

interface FindAuthorizationBody extends GetAuthorizationBody {
  userId: string
}

interface UpdateAutorizationBody {
  workspaceId: string
  sessionId: string
  userId: string
  deleted: boolean
  grantedBy: string
}

export const get = async (request: FastifyRequest<{ Body: GetAuthorizationBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, sessionId } = validateSessionBody(request)

    const users = await db
      .select()
      .from(sessionAccessTable)
      .where(and(
        eq(sessionAccessTable.workspaceId, workspaceId),
        eq(sessionAccessTable.sessionId, sessionId)
      ))

    await sendSuccessResponse(reply, { users })
  } catch (error) {
    await handleError(error, reply, 'Failed to retrieve session access')
  }
}

export const find = async (request: FastifyRequest<{ Body: FindAuthorizationBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, sessionId } = validateSessionBody(request)
    const { userId } = validateUserIdBody(request)

    const users = await db
      .select()
      .from(sessionAccessTable)
      .where(and(
        eq(sessionAccessTable.workspaceId, workspaceId),
        eq(sessionAccessTable.sessionId, sessionId),
        eq(sessionAccessTable.userId, userId)
      ))

    await sendSuccessResponse(reply, { users })
  } catch (error) {
    await handleError(error, reply, 'Failed to retrieve session access')
  }
}

export const update = async (request: FastifyRequest<{ Body: UpdateAutorizationBody }>, reply: FastifyReply): Promise<any> => {
  const { deleted = false } = request.body

  try {
    const { workspaceId, sessionId } = validateSessionBody(request)
    const { userId } = validateUserIdBody(request)

    if (deleted) {
      await db
        .delete(sessionAccessTable)
        .where(and(
          eq(sessionAccessTable.workspaceId, workspaceId),
          eq(sessionAccessTable.sessionId, sessionId),
          eq(sessionAccessTable.userId, userId)
        ))

      return await sendSuccessResponse(reply, null, 'Access was deleted successfully')
    }

    const users = await db
      .insert(sessionAccessTable)
      .values({
        workspaceId,
        sessionId,
        userId,
        grantedBy: '67502671'
      }).returning()

    await sendSuccessResponse(reply, { users })
  } catch (error) {
    request.log.error(error)
    await handleError(error, reply, 'Failed to update access')
  }
}
