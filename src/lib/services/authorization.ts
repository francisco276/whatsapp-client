import { User } from "@/types"
import { api } from "../axios"

const ROUTE = '/preferences/auth'

export const updateAuthorizationUser = async ({ workspaceId, userId, deleted }: { workspaceId: string, userId: string, deleted?: boolean }) => {
  try {
    const response = await api.post(`${ROUTE}`, {
      workspaceId,
      userId,
      deleted
    })

    return response.data
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}

type AuthorizationUserResponse = {
  authorizations: User[]
}

export const getAuthorizationUsers = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const response = await api.post<AuthorizationUserResponse>(`${ROUTE}/get`, {
      workspaceId,
    })

    return response.data
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}

export const getIfAuthorizationUserExist = async ({ workspaceId, userId }: { workspaceId: string, userId: string }): Promise<boolean> => {
  try {
    const response = await api.post<AuthorizationUserResponse>(`${ROUTE}/verify`, {
      workspaceId,
      userId
    })

    const { authorizations } = response.data
    if (authorizations.length === 1) {
      const authorization = authorizations[0]
      return authorization.userId === userId
    }

    return false
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}
