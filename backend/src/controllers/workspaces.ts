import type { RouteHandler } from 'fastify'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import { ConflictError } from '@/errors/errors'
import { sendSuccessResponse } from '@/helpers/responses'
import { validateWorkspaceBody } from '@/validations/body'
import { validateWorkspaceParam } from '@/validations/params'
import { handleError } from '@/helpers/errorHandler'
import { db } from '@/db'
import { authorizationTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

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

export const join: RouteHandler = async (req, res) => {
  const { user: { userId } } = req
  const { workspaceId, isAdmin } = req.body as { workspaceId: string, isAdmin: boolean }

  try {
    if (!isAdmin) {
      return await sendSuccessResponse(res, null, 'No admin privileges to sync')
    }

    let workspace = await WorkspaceManager.getWorkspace(workspaceId).catch(() => undefined)
    if (workspace === null || workspace === undefined) {
      workspace = await WorkspaceManager.createWorkspace({ id: workspaceId, name: workspaceId, userId })
    }

    const [existing] = await db
      .select()
      .from(authorizationTable)
      .where(and(eq(authorizationTable.workspaceId, workspaceId), eq(authorizationTable.userId, userId)))

    if (existing?.role === 'admin') {
      return await sendSuccessResponse(res, null, 'Already admin')
    }

    await db
      .insert(authorizationTable)
      .values({ userId, workspaceId, role: 'admin' })
      .onConflictDoUpdate({
        target: [authorizationTable.workspaceId, authorizationTable.userId],
        set: { role: 'admin' }
      })

    await sendSuccessResponse(res, null, 'Admin role assigned successfully')
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
