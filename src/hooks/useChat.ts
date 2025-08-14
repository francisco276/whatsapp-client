import { useContext } from 'react'
import { ChatContext } from '@/components/providers/chat/chat-context'

export const useChatId = () => {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatId must be used within a ChatProvider')
  }
  return context.chat
}
