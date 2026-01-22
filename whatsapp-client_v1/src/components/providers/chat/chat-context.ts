import { createContext } from 'react'

type StateContextType = {
  chat: string 
  setChat: React.Dispatch<React.SetStateAction<string>>
}

export const ChatContext = createContext<StateContextType>({ } as StateContextType)