import Fastify from 'fastify'
import fastifyMultipart from '@fastify/multipart'
import cors from '@fastify/cors'
import Routes from '@/routes'
import JWT from '@fastify/jwt'
import JWTConfig from '@/const/auth'

const app = Fastify({
  logger: true
})

app.register(fastifyMultipart, {
  attachFieldsToBody: false,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50 MB
  }
})

app.register(JWT, JWTConfig)
app.register(cors, {})

app.register(Routes, { prefix: 'api/v1' })

app.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

app.setNotFoundHandler((req, resp) => resp
  .status(404)
  .send({
    ok: false,
    message: 'Not Found'
  })
)

export default app
