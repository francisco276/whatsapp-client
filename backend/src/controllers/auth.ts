import { AppError } from '@/errors/errors'
import { handleError } from '@/helpers/errorHandler'
import { sendSuccessResponse } from '@/helpers/responses'
import { type FastifyRequest, type FastifyReply } from 'fastify'

interface AuthenticationBody {
  accountId: string
  userId: string
}

export const get = async (request: FastifyRequest<{ Body: AuthenticationBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { body } = request
    const token = request.server.jwt.sign(body)

    await sendSuccessResponse(reply, { token })
  } catch (error) {
    await handleError(error, reply)
  }
}

export const validate = async (request: FastifyRequest, reply: FastifyReply): Promise<any> => {
  try {
    await request.jwtVerify()
  } catch (error) {
    if (error instanceof Error) {
      const validateError = new AppError({ message: error.message, statusCode: 401, code: 'AUTHORIZATION_ERROR', name: 'AuthorizationError' })
      await handleError(validateError, reply)
    }
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticationBody
    user: AuthenticationBody
  }
}
