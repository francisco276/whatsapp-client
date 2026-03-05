import { useContext, useEffect, useRef } from 'react'
import { SessionContext } from '@/components/providers/session/session-context'
import { ChatContext } from '@/components/providers/chat/chat-context'
import { SocketClient } from '@/lib/socket'
import { handlerNotifyMessage } from '@/lib/socket-handlers/messages'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { Chat } from '@/lib/services/chats'
import { jidToFormatedPhone } from '@/utils/whatsapp'
import { usePreferences } from '@/hooks/usePreferences'
import { useUserId } from '@/hooks/useUserId'
import { useContext as useMondayContext } from '@/hooks/useContext'
import { MondayApi } from '@/lib/monday/api'

export const useRegisterNewMessage = ({ workspaceId, chats }: { workspaceId: string, chats?: Chat[] }) => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const incrementUnreadChat = unreadChatStore((state) => state.incrementUnreadChat)
  const setInitialData = unreadChatStore((state) => state.setInitialData)
  const userId = useUserId()
  const { config } = usePreferences({ userId })
  const { data: mondayContext } = useMondayContext()
  const monday = useRef(new MondayApi())
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const activeChatRef = useRef<string | undefined>(chat)
  const configRef = useRef(config)
  const chatsRef = useRef<Chat[]>(chats ?? [])
  const itemNameRef = useRef<string | null>(null)

  useEffect(() => {
    activeChatRef.current = chat
  }, [chat])

  useEffect(() => {
    configRef.current = config
  }, [config])

  useEffect(() => {
    if (chats && chats.length > 0) {
      chatsRef.current = chats
    }
  }, [chats])

  useEffect(() => {
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3')
    audioRef.current.load()
  }, [])

  useEffect(() => {
    if (!mondayContext?.itemId) return
    monday.current.query.getItemName(mondayContext.itemId)
      .then((res) => {
        const data = res.data as { items: { name: string }[] }
        if (data?.items?.[0]?.name) {
          itemNameRef.current = data.items[0].name
        }
      })
      .catch(() => {})
  }, [mondayContext?.itemId])

  useEffect(() => {
    console.log({ workspaceId, session})
    if (!workspaceId || !session) return

    const socket = new SocketClient({ workspaceId, sessionId: session })

    handlerNotifyMessage(socket, ({ id, unreadCount }) => {
      const currentChat = activeChatRef.current
      const isViewingThisChat = currentChat === id

      const chatEntry = chatsRef.current.find(c => c.id === id)
      const contactPhone = chatEntry?.name || jidToFormatedPhone(id) || id.split('@')[0]
      const displayName = itemNameRef.current || contactPhone

      console.log('[Notify] chatId:', id, 'contact:', displayName, 'itemName:', itemNameRef.current, 'activeChat:', currentChat, 'isViewing:', isViewingThisChat, 'unreadCount:', unreadCount)

      if (unreadCount > 0 && !isViewingThisChat) {
        incrementUnreadChat(id)

        const soundEnabled = configRef.current?.notifications?.soundEnabled !== false
        if (soundEnabled && audioRef.current) {
          audioRef.current.currentTime = 0
          audioRef.current.play().catch(e => console.log('Audio play failed:', e))
        }

        monday.current.notice(`Nuevo mensaje de WhatsApp de: ${displayName}`, 'info', 5000)
      }

      if (unreadCount === 0) {
        setInitialData(id, 0)
      }
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
