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
    const response = await api.get(`/${workspaceId}/${sessionId}${ROUTE}`, { timeout: 0 })

    return response.data as { chats: Chat[] }
  } catch (error) {
    throw new Error('Error on fetch chats')
  }
}

export const updateReadChat = async ({ workspaceId, sessionId, id }: { workspaceId: string, sessionId: string, id: string }) => {
  try {
    const response = await api.post(
      `/${workspaceId}/${sessionId}${ROUTE}/read`,
      {
        id
      },
    )

    return response.data as { chats: Chat[] }
  } catch (error) {
    throw new Error('Error on fetch chats')
  }
}
