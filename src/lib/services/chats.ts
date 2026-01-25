import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"

const ROUTE = '/chats'

export type Chat = {
  pkId: string
  id: string
  name: string
  description: string
  image?: string
  lastMessageRecvTimestamp: string
  unreadCount: number
}

export const getChats = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const { data: response } = await api.get<SuccessDataResponse<{ chats: Chat[] }>>(`/${workspaceId}/${sessionId}${ROUTE}`, { timeout: 60000 })

    return response.data
  } catch (error) {
    console.error('[getChats] Error fetching chats:', error)
    return { chats: [] }
  }
}

export const updateReadChat = async ({ workspaceId, sessionId, id }: { workspaceId: string, sessionId: string, id: string }) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<{ chats: Chat[] }>>(
      `/${workspaceId}/${sessionId}${ROUTE}/read`,
      {
        id
      },
    )
    return response.data
  } catch (error) {
    throw new Error('Error on fetch chats')
  }
}
