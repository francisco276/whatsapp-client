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
  // `isAdmin` is the monday account-admin flag sent by the frontend (context.user.isAdmin).
  const { workspaceId, isAdmin = false } = req.body as { workspaceId: string, isAdmin?: boolean }

  try {
    // 1. Ensure the workspace exists. Creating it must NOT, by itself, grant admin:
    //    admin is decided solely by the monday `isAdmin` flag in step 2. This is the fix
    //    for the "first user to open hijacks the workspace" bug.
    const workspace = await WorkspaceManager.getWorkspace(workspaceId).catch(() => undefined)
    if (workspace === null || workspace === undefined) {
      await WorkspaceManager.createWorkspace({ id: workspaceId, name: workspaceId, userId, grantAdmin: false })
    }

    // 2. Any monday account admin becomes an app admin. Idempotent and additive:
    //    onConflictDoNothing means it only inserts when the user has NO record yet, so it
    //    never deletes, never downgrades, and never overrides a role an admin set manually.
    if (isAdmin === true) {
      await db
        .insert(authorizationTable)
        .values({ userId, workspaceId, role: 'admin' })
        .onConflictDoNothing({ target: [authorizationTable.workspaceId, authorizationTable.userId] })
      return await sendSuccessResponse(res, null, 'Admin access granted')
    }

    // 3. Non-admin caller: if they already have a record, leave it exactly as-is.
    const [existing] = await db
      .select()
      .from(authorizationTable)
      .where(and(eq(authorizationTable.workspaceId, workspaceId), eq(authorizationTable.userId, userId)))

    if (existing) {
      return await sendSuccessResponse(res, null, 'Already registered')
    }

    // 4. Non-admin without a record: never auto-grant admin. If no admin exists yet, the
    //    workspace stays pending until a real monday admin opens it (step 2 handles that).
    const [existingAdmin] = await db
      .select()
      .from(authorizationTable)
      .where(and(eq(authorizationTable.workspaceId, workspaceId), eq(authorizationTable.role, 'admin')))

    if (!existingAdmin) {
      return await sendSuccessResponse(res, null, 'Workspace pending: waiting for an admin to set it up')
    }

    await sendSuccessResponse(res, null, 'No auto-join — contact admin')
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
