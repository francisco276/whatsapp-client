import { AuthorizationUser } from "@/types"
import { api } from "../axios"
import { SuccessDataResponse } from "@/types/response"

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

export const getAuthorizationUsers = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<AuthorizationUser>>(`${ROUTE}/get`, {
      workspaceId,
    })
    return response.data
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}

export const getIfAuthorizationUserExist = async ({ workspaceId, userId }: { workspaceId: string, userId: string }): Promise<boolean> => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<AuthorizationUser>>(`${ROUTE}/verify`, {
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
