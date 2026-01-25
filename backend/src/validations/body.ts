import { FastifyRequest } from 'fastify'
import { MissingParameters } from '@/errors/errors'

export const validateWorkspaceBody = (request: FastifyRequest): { workspaceId: string, name: string } => {
  const { workspaceId, name } = request.body as { workspaceId: string, name: string }

  if (typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    throw new MissingParameters('Workspace id is required.')
  }

  if (typeof name !== 'string' || name.trim().length === 0) {
    throw new MissingParameters('Workspace name is required.')
  }

  return { workspaceId, name }
}

export const validateSessionBody = (request: FastifyRequest): { workspaceId: string, sessionId: string } => {
  const { workspaceId, sessionId } = request.body as { workspaceId: string, sessionId: string }

  if (typeof workspaceId !== 'string' || workspaceId.trim().length === 0) {
    throw new MissingParameters('Workspace id is required.')
  }

  if (typeof sessionId !== 'string' || sessionId.trim().length === 0) {
    throw new MissingParameters('Session id is required.')
  }
  return { workspaceId, sessionId }
}

export const validateUserIdBody = (request: FastifyRequest): { userId: string } => {
  const { userId } = request.body as { userId: string }

  if (typeof userId !== 'string' || userId.trim().length === 0) {
    throw new MissingParameters('User id is required.')
  }

  return { userId }
}

export const validateChatBody = (request: FastifyRequest): { id: string } => {
  const { id } = request.body as { id: string }

  if (typeof id !== 'string' || id.trim().length === 0) {
    throw new MissingParameters('Chat id is required.')
  }

  return { id }
}
