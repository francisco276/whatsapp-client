import { SessionContext } from '@/components/providers/session/session-context'
import { useContext } from 'react'

export const useSessionId = () => {
  const context = useContext(SessionContext)
  if (context === undefined) {
    throw new Error('useSessionId must be used within a SessionProvider')
  }
  return context.session
}
