import { useState } from 'react'
import { ChatContext } from './chat-context'

export const ChatProvider = ({ children, chatId }: { children: React.ReactElement, chatId?: string }) => {
  const [chat, setChat] = useState<string>(chatId ?? '')

  const value = { chat, setChat }

	return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}
