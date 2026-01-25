import { FastifyRequest } from 'fastify'
import { MissingParameters } from '@/errors/errors'

export const validateWorkspaceParam = (request: FastifyRequest): string => {
  const { params } = request as { params: { workspaceId: string } }
  if (typeof params.workspaceId !== 'string' || params.workspaceId.trim().length === 0) {
    throw new MissingParameters('Workspace id parameter is missing.')
  }

  return params.workspaceId
}

export const validateWorkspaceParams = (request: FastifyRequest): { workspaceId: string, name: string, userId: string } => {
  const { workspaceId, name, userId } = request.params as { workspaceId: string, name: string, userId: string }

  if (typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    throw new MissingParameters('Workspace id is required.')
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new MissingParameters('Workspace name is required.')
  }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new MissingParameters('User id is required.')
  }
  return { workspaceId, name, userId }
}

export const validateSessionParam = (request: FastifyRequest): { workspaceId: string, sessionId: string } => {
  const { workspaceId, sessionId } = request.params as { workspaceId: string, sessionId: string }

  if (typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    throw new MissingParameters('Workspace id is required.')
  }

  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    throw new MissingParameters('Session id is required.')
  }
  return { workspaceId, sessionId }
}
