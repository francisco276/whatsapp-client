import { createContext } from 'react'

type StateContextType = {
  session: string 
  setSession: React.Dispatch<React.SetStateAction<string>>
}

export const SessionContext = createContext<StateContextType>({ } as StateContextType)