import type { RouteHandler } from 'fastify'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import { handleError } from '@/helpers/errorHandler'
import { sendSuccessResponse } from '@/helpers/responses'
import { validateSessionParam } from '@/validations/params'
import { NotFoundError } from '@/errors/errors'

export const find: RouteHandler = async (req, res): Promise<any> => {
  try {
    const { workspaceId, sessionId } = validateSessionParam(req)

    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    const session = workspace.getSession(sessionId)

    if (session.session?.user === undefined) {
      throw new NotFoundError('Session user not found')
    }

    await session.ensureConnected()

    const { id, name, notify } = session.session.user

    let image: string | undefined
    try {
      image = await session.session.profilePictureUrl(id, 'preview')
    } catch (err) {
      image = ''
    }
    await sendSuccessResponse(res, { user: { name: name ?? notify, image, ...session.session.user } })
  } catch (error) {
    await handleError(error, res)
  }
}
