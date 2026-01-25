import { FastifyReply } from 'fastify'

export const sendSuccessResponse = (reply: FastifyReply, data?: any, message?: string, statusCode = 200): FastifyReply => {
  return reply
    .status(statusCode)
    .send({
      ok: true,
      ...((data !== undefined && data !== null) && { data }),
      message
    })
}

export const sendErrorResponse = (reply: FastifyReply, message: string, statusCode = 500, code: string): FastifyReply => {
  return reply
    .status(statusCode)
    .send({
      ok: false,
      error: message,
      code
    })
}
