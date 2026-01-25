export class AppError extends Error {
  name: string
  code: string
  statusCode: number
  message: string

  constructor ({ name, code, statusCode, message }: { name: string, code: string, statusCode: number, message: string }) {
    super()
    this.name = name
    this.code = code
    this.statusCode = statusCode
    this.message = message
  }
}

export class NotFoundError extends AppError {
  constructor (message: string) {
    super({
      name: 'NotFoundError',
      code: 'NOT_FOUND_ERROR',
      statusCode: 404,
      message
    })
  }
}

export class ConflictError extends AppError {
  constructor (message: string) {
    super({
      name: 'ConflictError',
      code: 'Conflict_Error',
      statusCode: 409,
      message
    })
  }
}

export class ValidationError extends AppError {
  constructor (message: string) {
    super({
      name: 'ValidationError',
      code: 'VALIDATION_ERRROR',
      statusCode: 400,
      message
    })
  }
}

export class MissingParameters extends AppError {
  constructor (message: string) {
    super({
      name: 'MissingParameters',
      code: 'MISSING_PARAMETERS',
      statusCode: 400,
      message
    })
  }
}

export class MessageError extends AppError {
  constructor (message: string) {
    super({
      name: 'MessageError',
      code: 'MESSAGE_ERROR',
      statusCode: 400,
      message
    })
  }
}

export class AuthorizationError extends AppError {
  constructor (message: string) {
    super({
      name: 'AuthorizationError',
      code: 'AUTHORIZATION_ERROR',
      statusCode: 401,
      message
    })
  }
}
