import { ChatHeader } from '@/components/chats/chat-header'
import { EmptyState } from '@/components/empty-state'
import { MessageInput } from "@/components/messages/message-input"
import { MessageQueueStatus } from "@/components/messages/message-queue-status"
import { useChatId } from '@/hooks/useChat'
import { Box, Text } from '@vibe/core'
import { useMessageCounterStore } from '@/stores/messageCounterStore'

export const Chat = ({ children }: { children: React.ReactNode }) => {
  const chatId = useChatId()
  const sentCount = useMessageCounterStore((state) => state.sentCount)

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
        <MessageQueueStatus />
        <MessageInput />
        <div className="mt-1 text-right">
          <Text type="text3" color="secondary">Mensajes enviados: {sentCount}</Text>
        </div>
      </div>
    </div>
  )
}
