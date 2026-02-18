import { SocketClient } from "../socket"
import type { NotificationEvent, SocketSuccessResponse } from '@/types/socket'

export const handlerNotifyMessage = (socket: SocketClient, callback: (data: { id: string, unreadCount: number }) => void | Promise<void>) => {
  socket.on('chats.upsert', (event) => {
    const { data: eventData } = event
    if (eventData?.status === 'success') {
      const { data } = event as SocketSuccessResponse
      if (data?.data) {
        const { unreadCount, id } = data.data as NotificationEvent
        console.log('[Socket] chats.upsert:', { id, unreadCount })
        if (id !== undefined && unreadCount > 0) {
          callback({ id, unreadCount })
        }
      }
    }
  })

  socket.on('chats.update', (event) => {
    const { data: eventData } = event
    if (eventData?.status === 'success') {
      const { data } = event as SocketSuccessResponse
      if (data?.data) {
        const chatData = data.data as { chats?: NotificationEvent }
        const chat = chatData?.chats
        console.log('[Socket] chats.update:', { id: chat?.id, unreadCount: chat?.unreadCount })
        if (chat?.id !== undefined && chat.unreadCount > 0) {
          callback({ id: chat.id, unreadCount: chat.unreadCount })
        }
      }
    }
  })
}
