import { useContext } from 'react'
import { UserContext } from '@/components/providers/user/user-context'

export const useUserId = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUserId must be used within a User Provider')
  }
  return context
}
