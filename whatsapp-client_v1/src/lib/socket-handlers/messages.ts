import { SocketClient } from "../socket"
import type { NotificationEvent, SocketSuccessResponse } from '@/types/socket'

export const handlerNotifyMessage = (socket: SocketClient, callback: (data: { id: string, unreadCount: number }) => void | Promise<void>) => {
  socket.on('chats.upsert', (event) => {
    const { data: eventData } = event
    if (eventData.status === 'success') {
      const { data } = event as SocketSuccessResponse
      const { unreadCount, id } = data.data as NotificationEvent
      callback({ id, unreadCount })
    }
  })

  socket.on('chats.update', (event) => {
    const { data: eventData } = event
    if (eventData.status === 'success') {
      const { data } = event as SocketSuccessResponse
      const { chats: chat } = data.data as { chats: NotificationEvent }
      if (chat) {
        callback({ id: chat.id, unreadCount: chat.unreadCount })
      }
    }
  })
}
