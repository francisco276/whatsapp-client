import { useContext, useEffect } from 'react'
import { SessionContext } from '@/components/providers/session/session-context'
import { ChatContext } from '@/components/providers/chat/chat-context'
import { SocketClient } from '@/lib/socket'
import { handlerNotifyMessage } from '@/lib/socket-handlers/messages'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { Chat } from '@/lib/services/chats'

export const useRegisterNewMessage = ({ workspaceId, chats }: { workspaceId: string, chats?: Chat[] }) => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const incrementUnreadChat = unreadChatStore((state) => state.incrementUnreadChat)
  const setInitialData = unreadChatStore((state) => state.setInitialData)

  useEffect(() => {
    console.log({ workspaceId, session})
    if (!workspaceId || !session) return

    const socket = new SocketClient({ workspaceId, sessionId: session })

    handlerNotifyMessage(socket, ({ id, unreadCount }) => {
      if (chat !== id && unreadCount) incrementUnreadChat(id)
      if (chat !== id && (unreadCount === 0)) setInitialData(id, unreadCount)
    })
 
    return () => {
      socket?.disconnect()
    }
  }, [workspaceId, session])

  chats?.forEach((chat) => {
    if (chat.unreadCount) {
      setInitialData(chat.id, chat.unreadCount)
    }
  })
}
