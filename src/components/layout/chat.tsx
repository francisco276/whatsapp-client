import { ChatHeader } from '@/components/chats/chat-header'
import { EmptyState } from '@/components/empty-state'
import { MessageInput } from "@/components/messages/message-input"
import { useChatId } from '@/hooks/useChat'
import { Box } from '@vibe/core'

export const Chat = ({ children }: { children: React.ReactNode }) => {
  const chatId = useChatId()

  if (!chatId) {
    return (
      <Box className='flex-1'>
        <EmptyState
          title='Bienvenido'
          description='Selecciona un chat para ver su conversacion'
          icon='Update'
          iconClassName="text-[#0DACC8]"
        />
      </Box>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader />
      {children}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <MessageInput />
      </div>
    </div>
  )
}
