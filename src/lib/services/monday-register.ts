import { api } from "../axios"
import { SuccessDataResponse } from "@/types/response"

const ROUTE = '/monday'

export const registerMondayTarget = async ({
  workspaceId,
  userId,
  boardId,
  mondayToken
}: {
  workspaceId: string
  userId: string
  boardId: string
  mondayToken?: string
}) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<{ registered: boolean }>>(
      `${ROUTE}/register`,
      { workspaceId, userId, boardId, mondayToken }
    )
    return response.data
  } catch (error) {
    console.error('[registerMondayTarget] Error:', error)
    return null
  }
}
