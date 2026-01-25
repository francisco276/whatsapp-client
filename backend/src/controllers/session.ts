import type { RouteHandler } from 'fastify'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import { validateWorkspaceParam, validateSessionParam } from '@/validations/params'
import { validateSessionBody } from '@/validations/body'
import { handleError } from '@/helpers/errorHandler'
import { sendSuccessResponse } from '@/helpers/responses'
import { AuthorizationError, ConflictError } from '@/errors/errors'
import { getAuthorizationUser } from '@/services/authorizations'
import { getRoleInformation } from '@/utils/authorization'

export const list: RouteHandler = async (req, res): Promise<any> => {
  try {
    const { user: { userId } } = req
    const workspaceId = validateWorkspaceParam(req)
    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    const sessions = await workspace.listSessions({ userId })

    await sendSuccessResponse(res, { sessions })
  } catch (error) {
    await handleError(error, res)
  }
}

export const find: RouteHandler = async (req, res): Promise<any> => {
  try {
    const { workspaceId, sessionId } = validateSessionParam(req)

    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    workspace.getSession(sessionId)

    await sendSuccessResponse(res, { session: { id: sessionId } })
  } catch (error) {
    await handleError(error, res)
  }
}

export const add: RouteHandler = async (req, res) => {
  try {
    const { user: { userId } } = req
    const { workspaceId, sessionId } = validateSessionBody(req)

    const user = await getAuthorizationUser({ workspaceId, userId })
    const roleInformation = getRoleInformation(user)

    if (!roleInformation.addSession) {
      throw new AuthorizationError('User is not authorized to add a session')
    }

    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    if (workspace.sessionExists(sessionId)) {
      throw new ConflictError('Session already exists')
    }

    const qr = await workspace.addSession({ sessionId, insert: true, isSynced: true, userId })

    await sendSuccessResponse(res, { qr }, 'Session created successfully')
  } catch (error) {
    await handleError(error, res)
  }
}

export const del: RouteHandler = async (req, res) => {
  try {
    const { user: { userId } } = req
    const { workspaceId, sessionId } = validateSessionBody(req)

    const user = await getAuthorizationUser({ workspaceId, userId })
    const roleInformation = getRoleInformation(user)

    if (!roleInformation.removeSession) {
      throw new AuthorizationError('User is not authorized to remove a session')
    }

    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    await workspace.deleteSession(sessionId)

    await sendSuccessResponse(res, null, 'Session deleted successfully')
  } catch (error) {
    await handleError(error, res)
  }
}
