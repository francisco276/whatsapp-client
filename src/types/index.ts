export type User = {
  id: string,
  userId: string,
  workspaceId: string
  role: string
}

export type AuthorizedUser = {
  id: string
  image: string
  name: string
  workspaceId: string
  authorized: boolean
  role: string
}

export type UserPreferencesConfig = {
  notifications: {
    onMessageSend: boolean
  }
}

export type Session = { id: string, isSynced: boolean }

export type AuthorizationUser = {
  authorizations: User[]
}
