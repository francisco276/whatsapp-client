import { useContext, useEffect, useRef } from 'react'
import { SessionContext } from '@/components/providers/session/session-context'
import { ChatContext } from '@/components/providers/chat/chat-context'
import { SocketClient } from '@/lib/socket'
import { handlerNotifyMessage } from '@/lib/socket-handlers/messages'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { Chat } from '@/lib/services/chats'
import { useNotifications } from '@/hooks/useNotifications'
import { usePreferences } from '@/hooks/usePreferences'
import { useUserId } from '@/hooks/useUserId'
import { useServiceWorker } from '@/hooks/useServiceWorker'
import { MondayApi } from '@/lib/monday/api'

export const useRegisterNewMessage = ({ workspaceId, chats }: { workspaceId: string, chats?: Chat[] }) => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const incrementUnreadChat = unreadChatStore((state) => state.incrementUnreadChat)
  const setInitialData = unreadChatStore((state) => state.setInitialData)
  const { sendNotifications } = useNotifications()
  const userId = useUserId()
  const { config } = usePreferences({ userId })
  const monday = useRef(new MondayApi())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const { sendNotification: sendBrowserNotification } = useServiceWorker()
  const lastUnreadRef = useRef<Map<string, number>>(new Map())

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
    audioRef.current.load()
  }, [])

  useEffect(() => {
    console.log({ workspaceId, session})
    if (!workspaceId || !session) return

    const socket = new SocketClient({ workspaceId, sessionId: session })

    handlerNotifyMessage(socket, ({ id, unreadCount }) => {
      const previousUnread = lastUnreadRef.current.get(id) ?? 0
      lastUnreadRef.current.set(id, unreadCount)

      const isNewIncoming = unreadCount > previousUnread

      if (chat !== id && isNewIncoming) {
        incrementUnreadChat(id)
        
        const soundEnabled = config?.notifications?.soundEnabled !== false
        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(e => console.log('Audio play failed:', e))
        }

        if (soundEnabled) {
          sendBrowserNotification({ chatId: id })
        }
        
        sendNotifications()
        monday.current.notice('Nuevo mensaje de WhatsApp recibido', 'info', 3000)
      }
      if (chat !== id && (unreadCount === 0)) {
        setInitialData(id, unreadCount)
        lastUnreadRef.current.set(id, 0)
      }
    })
 
    return () => {
      socket?.disconnect()
    }
  }, [workspaceId, session, chat, config])

  chats?.forEach((chat) => {
    if (chat.unreadCount) {
      setInitialData(chat.id, chat.unreadCount)
    }
  })
}
