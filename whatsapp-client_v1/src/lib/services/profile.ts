import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"
const ROUTE = '/profile'

export const getProfile = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const { data: response } = await api.get<SuccessDataResponse<{ user: { name?: string, id: string, image: string } }>>(`${ROUTE}/${workspaceId}/${sessionId}`)
    return response.data
  } catch (error) {
    throw new Error('Error on fetch sessions')
  }
}
