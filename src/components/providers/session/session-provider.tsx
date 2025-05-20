import { useState } from 'react'
import { SessionContext } from './session-context'

export const SessionProvider = ({ children }: { children: React.ReactElement }) => {
  const [session, setSession] = useState<string>('')

  const value = { session, setSession }

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  )
}
