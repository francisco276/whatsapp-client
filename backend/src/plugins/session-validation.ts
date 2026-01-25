import { FastifyReply, FastifyRequest } from 'fastify'
import { WorkspaceManager } from '@/services/WorkspacesManager'
import { Workspace } from '@/services/Workspace'
import WhatsAppService from '@/services/whatsapp/service'
import { validateSessionParam } from '@/validations/params'
import { handleError } from '@/helpers/errorHandler'

export const sessionValidationPlugin = async (request: FastifyRequest, reply: FastifyReply): Promise<any> => {
  // Only run validation if the route has both workspaceId and sessionId
  try {
    const { workspaceId, sessionId } = validateSessionParam(request)

    const workspace = await WorkspaceManager.getWorkspace(workspaceId)

    const session = workspace.getSession(sessionId)

    request.workspace = workspace
    request.session = session
  } catch (error) {
    await handleError(error, reply, 'Failed to validate session')
  }
}

// Extend FastifyRequest to include the session and workspace
declare module 'fastify' {
  interface FastifyRequest {
    workspace: Workspace
    session: WhatsAppService
  }
}
