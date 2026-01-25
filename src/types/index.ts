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
    soundEnabled?: boolean
  }
}

export enum WAStatus {
  Unknown = 'unknown',
  WaitQrcodeAuth = 'wait_for_qrcode_auth',
  Authenticated = 'authenticated',
  PullingWAData = 'pulling_wa_data',
  Connected = 'connected',
  Disconnected = 'disconected'
}

export type Session = { id: string, isSynced: boolean, status?: WAStatus }

export type AuthorizationUser = {
  authorizations: User[]
}

export type AccessUser = Omit<User, 'role'> & {
  grantedBy: string
  sessionId: string
}

export type SessionAccessUser = {
  users: AccessUser[]
}
