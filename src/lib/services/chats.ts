import { api } from "../axios"

const ROUTE = '/chats'

export type Chat = {
  pkId: string
  id: string
  name: string
  description: string
  image?: string
  lastMessageRecvTimestamp: string
}

export const getChats = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const response = await api.get(`${ROUTE}/${workspaceId}/${sessionId}`, { timeout: 0 })

    return response.data as { chats: Chat[] }
  } catch (error) {
    throw new Error('Error on fetch chats')
  }
}
