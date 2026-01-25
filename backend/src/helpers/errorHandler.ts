import { errorCodes, FastifyReply } from 'fastify'
import { AppError } from '@/errors/errors'
import { sendErrorResponse } from './responses'

export const handleError = (error: any, reply: FastifyReply, message?: string): FastifyReply => {
  if (error instanceof AppError) {
    return sendErrorResponse(reply, error.message, error.statusCode, error.code)
  }

  if (error instanceof errorCodes.FST_ERR_VALIDATION) {
    return sendErrorResponse(reply, error.message, error.statusCode, error.code)
  }

  return sendErrorResponse(reply, message ?? 'An unexpected error occurred', 500, 'INTERNAL_SERVER_ERROR')
}
