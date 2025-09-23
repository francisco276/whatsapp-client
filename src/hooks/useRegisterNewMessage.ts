import { useContext, useEffect, useMemo } from 'react'
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

  const socket = useMemo(() => new SocketClient({ workspaceId, sessionId: session }), [workspaceId, session])

  useEffect(() => {
    handlerNotifyMessage(socket, ({ id }) => {
      if (chat !== id) incrementUnreadChat(id)
    })

    return (() => {
      socket.disconnect()
    })
  }, [socket])

  chats?.forEach((chat) => {
    if (chat.unreadCount) {
      setInitialData(chat.id, chat.unreadCount)
    }
  })
}
