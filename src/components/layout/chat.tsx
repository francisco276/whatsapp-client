import { ChatHeader } from '@/components/chats/chat-header'
import { EmptyState } from '@/components/empty-state'
import { MessageInput } from "@/components/messages/message-input"
import { useChatId } from '@/hooks/useChat'
import { Box, Text } from '@vibe/core'
import { useEffect, useState } from 'react'

export const Chat = ({ children }: { children: React.ReactNode }) => {
  const chatId = useChatId()
  const [sentCount, setSentCount] = useState(0)

  useEffect(() => {
    const updateCount = () => {
      setSentCount(parseInt(localStorage.getItem('messages_sent_total_count') || '0'))
    }
    updateCount()
    window.addEventListener('storage', updateCount)
    const interval = setInterval(updateCount, 1000)
    return () => {
      window.removeEventListener('storage', updateCount)
      clearInterval(interval)
    }
  }, [])

  if (!chatId) {
    return (
      <Box className='flex-1'>
        <EmptyState
          title='Bienvenido'
          description='Selecciona un chat para ver su conversacion'
          icon='Update'
          iconClassName="text-[#0DACC8]"
        />
        <Box className="p-4 text-center">
          <Text type="text2" color="secondary">Mensajes enviados desde la app: {sentCount}</Text>
        </Box>
      </Box>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      {children}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <MessageInput />
        <div className="mt-1 text-right">
          <Text type="text3" color="secondary">Mensajes enviados: {sentCount}</Text>
        </div>
      </div>
    </div>
  )
}
