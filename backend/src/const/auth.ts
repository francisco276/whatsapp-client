import { FastifyJWTOptions } from '@fastify/jwt'

const options: FastifyJWTOptions = {
  secret: process.env.JWT_SECRET ?? 'SimpleTestToken',
  sign: {
    expiresIn: '15m'
  }
}

export default options
