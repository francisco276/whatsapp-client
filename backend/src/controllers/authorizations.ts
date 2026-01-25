import type { FastifyRequest, FastifyReply } from 'fastify'
import { db } from '@/db'
import { authorizationTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { getAuthorizationUser } from '@/services/authorizations'
import { getRoleInformation } from '@/utils/authorization'
import { AuthorizationError } from '@/errors/errors'

interface GetAuthorizationBody {
  workspaceId: string
}

interface FindAuthorizationBody extends GetAuthorizationBody {
  userId: string
}

interface UpdateAutorizationBody {
  workspaceId: string
  userId: string
  deleted?: boolean
  role: string
}

export const get = async (request: FastifyRequest<{ Body: GetAuthorizationBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId } = request.body
    const authorizations = await db
      .select()
      .from(authorizationTable)
      .where(and(
        eq(authorizationTable.workspaceId, workspaceId)
      ))

    await sendSuccessResponse(reply, { authorizations })
  } catch (error) {
    await handleError(error, reply, 'Failed to retrieve authorizations')
  }
}

export const find = async (request: FastifyRequest<{ Body: FindAuthorizationBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, userId } = request.body
    const authorizations = await db
      .select()
      .from(authorizationTable)
      .where(and(
        eq(authorizationTable.workspaceId, workspaceId),
        eq(authorizationTable.userId, userId)
      ))

    await sendSuccessResponse(reply, { authorizations })
  } catch (error) {
    await handleError(error, reply, 'Failed to retrieve authorizations')
  }
}

export const update = async (request: FastifyRequest<{ Body: UpdateAutorizationBody }>, reply: FastifyReply): Promise<any> => {
  const { user: { userId: sessionId } } = request
  const { userId, workspaceId, deleted = false, role = 'user' } = request.body

  try {
    const user = await getAuthorizationUser({ workspaceId, userId: sessionId })
    const roleInformation = getRoleInformation(user)

    if (!roleInformation.deleteUser) {
      throw new AuthorizationError('User is not authorized to delete an authorization')
    }

    if (deleted) {
      await db
        .delete(authorizationTable)
        .where(and(
          eq(authorizationTable.workspaceId, workspaceId),
          eq(authorizationTable.userId, userId)
        ))

      return await sendSuccessResponse(reply, null, 'Authorization was deleted successfully')
    }

    const validRole = authorizationTable.role.enumValues.find(value => value === role)
    const authorizations = await db
      .insert(authorizationTable)
      .values({
        userId,
        workspaceId,
        ...(roleInformation.editRole && (validRole !== undefined) ? { role: validRole } : {})
      }).onConflictDoUpdate({
        target: [authorizationTable.workspaceId, authorizationTable.userId],
        set: {
          ...(roleInformation.editRole && (validRole !== undefined) ? { role: validRole } : {})
        }
      })
      .returning()

    await sendSuccessResponse(reply, { authorizations })
  } catch (error) {
    request.log.error(error)
    await handleError(error, reply, 'Failed to update an authorization')
  }
}
