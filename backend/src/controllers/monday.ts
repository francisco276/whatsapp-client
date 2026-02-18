import type { FastifyRequest, FastifyReply } from 'fastify'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { registerMondayCredentials, registerMondayUserTarget } from '@/services/monday-notifications'
import { AuthorizationError } from '@/errors/errors'
import { getAuthorizationUser } from '@/services/authorizations'

interface RegisterBody {
  workspaceId: string
  userId: string
  boardId: string
  mondayToken?: string
}

export const register = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, userId, boardId, mondayToken } = request.body
    const { userId: authenticatedUserId } = request.user

    if (authenticatedUserId !== userId) {
      throw new AuthorizationError('User ID mismatch')
    }

    if (mondayToken !== undefined && mondayToken !== '') {
      const user = await getAuthorizationUser({ workspaceId, userId })
      if (user.role !== 'admin') {
        throw new AuthorizationError('Only admins can set the Monday API token')
      }
      await registerMondayCredentials(workspaceId, mondayToken)
    }

    await registerMondayUserTarget(workspaceId, userId, boardId)

    await sendSuccessResponse(reply, { registered: true })
  } catch (error) {
    await handleError(error, reply, 'Failed to register Monday notification target')
  }
}
