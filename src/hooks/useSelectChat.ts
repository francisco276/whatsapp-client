import { useMutation } from '@tanstack/react-query'
import { updateReadChat } from '@/lib/services/chats'
import { markMessagesAsRead } from '@/lib/services/messages'
import { useWorkspaceId } from './useWorkspaceId'
import { useSessionId } from './useSessionId'
import { useChatId } from './useChat'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { Message } from '@/types/message'
import { useEffect } from 'react'

export const useSelectChat = (messages: Message[]) => {
  const workspaceId = useWorkspaceId()
  const sessionId = useSessionId()
  const chatId = useChatId()

  const unread = unreadChatStore((state) => state.contacts[chatId])
  const resetChat = unreadChatStore((state) => state.resetUnreadChat)

  const { mutate: mutateUpdateReadChat } = useMutation({
    mutationKey: ['UpdateChatToRead'],
    mutationFn: updateReadChat
  })

  const { mutate: mutateMarkMessagesAsRead, isError, isPending } =  useMutation({
    mutationKey: ['MarkMessagesAsRead'],
    mutationFn: markMessagesAsRead,
    retry: 1
  })

  function selectChat () {
    const readMessages = messages.slice(0, unread).map(message => message.key).reverse()
    mutateMarkMessagesAsRead({ workspaceId, sessionId, readMessages }, {
      onSuccess: () => {
        resetChat(chatId)
        mutateUpdateReadChat({ id: chatId, sessionId, workspaceId  })
      }
    })
  }

  useEffect(() => {
    const listIsNotEmpty = messages.length > 0
    const hasMessagesToRead  = unread > 0

    if (listIsNotEmpty && chatId && hasMessagesToRead && !isError && !isPending) {
      selectChat()
    }
  }, [messages, chatId, unread, isError, isPending])
}
