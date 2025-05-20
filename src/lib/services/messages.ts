import { api } from "../axios"
import type { MessageList, Message } from "../../types/message"
import { formatMessage } from "../../utils/message"

const ROUTE = '/messages'


export const getMessages = async ({ workspaceId, sessionId, chatId, offset }: { workspaceId: string, sessionId: string, chatId: string, cursor?: number | string, offset?: number | string }) => {
  try {
    const response = await api.get(
      `${workspaceId}/${sessionId}${ROUTE}/list/${chatId}`,
      {
        params: {
          offset
        },
        timeout: 0
      }
    )

    return response.data as MessageList
  } catch (error) {
    throw new Error('Error on fetch messages')
  }
}

export const sendMessage = async ({ workspaceId, sessionId, chatId, message }: { workspaceId: string, sessionId: string, chatId: string, message: string }) => {
  const formatedMessage = formatMessage({ jid: chatId, message })
  try {
    const response = await api.post(
      `${workspaceId}/${sessionId}${ROUTE}/send`,
      formatedMessage
      , { timeout: 0 }
    )

    return response.data
  } catch (error) {
    throw new Error('Error on send message')
  }
}

export async function downloadMedia({ workspaceId, sessionId, message }: { workspaceId: string, sessionId: string, message?: Message }) {
  if (message === undefined) {
    throw new Error('Message is required')
  }

  try {
    const response = await api.post(
      `${workspaceId}/${sessionId}${ROUTE}/download`,
      message,
      {
        timeout: 0,
        responseType: 'arraybuffer',
      }
    )

    const mimeType = response.headers['content-type'] || 'application/octet-stream'
    const blob = new Blob([response.data], { type: mimeType })

    const url = URL.createObjectURL(blob)

    return url
  } catch (error) {
    throw new Error('Error downloading media')
  }
}
