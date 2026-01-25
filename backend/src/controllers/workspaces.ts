import type { RouteHandler } from 'fastify'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import { ConflictError } from '@/errors/errors'
import { sendSuccessResponse } from '@/helpers/responses'
import { validateWorkspaceBody } from '@/validations/body'
import { validateWorkspaceParam } from '@/validations/params'
import { handleError } from '@/helpers/errorHandler'

export const find: RouteHandler = async (req, res): Promise<any> => {
  try {
    const workspaceId = validateWorkspaceParam(req)
    const workspace = await WorkspaceManager.getWorkspace(workspaceId)
    await sendSuccessResponse(res, workspace)
  } catch (error) {
    await handleError(error, res)
  }
}

export const add: RouteHandler = async (req, res) => {
  const { user: { userId } } = req
  const { workspaceId, name } = validateWorkspaceBody(req)
  try {
    const workspace = await WorkspaceManager.getWorkspace(workspaceId).catch(() => undefined)
    if (workspace !== null && workspace !== undefined) {
      throw new ConflictError('Workspace already exists')
    }

    await WorkspaceManager.createWorkspace({ id: workspaceId, name, userId })

    await sendSuccessResponse(res, null, 'Workspace created successfully', 201)
  } catch (error) {
    await handleError(error, res)
  }
}

export const del: RouteHandler = async (req, res) => {
  try {
    const workspaceId = validateWorkspaceParam(req)
    await WorkspaceManager.deleteWorkspace(workspaceId)
    await sendSuccessResponse(res, null, 'Workspace deleted successfully')
  } catch (error) {
    await handleError(error, res)
  }
}
