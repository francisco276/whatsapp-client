import { useState } from 'react'
import { ChatContext } from './chat-context'

export const ChatProvider = ({ children }: { children: React.ReactElement }) => {
  const [chat, setChat] = useState<string>('')

  const value = { chat, setChat }

	return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}