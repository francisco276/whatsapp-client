export const list = {
  type: 'object',
  properties: {
    workspaceId: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['workspaceId']
} as const

export const find = {
  type: 'object',
  properties: {
    templateId: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['templateId']
} as const

export const add = {
  type: 'object',
  properties: {
    name: {
      type: 'string',
      minLength: 1
    },
    description: {
      type: 'string',
      minLength: 1
    },
    message: {
      type: 'string',
      minLength: 1
    },
    workspaceId: {
      type: 'string',
      minLength: 1
    }
  },
  required: ['name', 'message', 'workspaceId']
} as const

export const update = {
  type: 'object',
  properties: {
    templateId: {
      type: 'string',
      minLength: 1
    },
    active: {
      type: 'boolean'
    },
    ...add.properties
  },
  required: [
    'templateId',
    ...add.required
  ]
} as const
