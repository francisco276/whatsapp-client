import { api } from "../axios"
import { SuccessDataResponse } from "@/types/response"

const ROUTE = '/'

export const getToken = async ({ workspaceId, userId, }: { workspaceId: string, userId: string, }) => {
  try {
    const response = await api.post<SuccessDataResponse<{ token: string }>>(`${ROUTE}`, {
      accountId: workspaceId,
      userId,
    })

    localStorage.setItem('auth_token', response.data.data.token)

    return response.data
  } catch {
    throw new Error('Error on get user token')
  }
}
