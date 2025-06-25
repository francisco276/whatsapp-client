export type User = {
  id: string,
  userId: string,
  workspaceId: string
}

export type AuthorizedUser = {
  id: string
  image: string
  name: string
  workspaceId: string
  authorized: boolean
}

export type UserPreferencesConfig = {
  notifications: {
    onMessageSend: boolean
  }
}
