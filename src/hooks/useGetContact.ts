import { useQuery } from '@tanstack/react-query'
import { getContact } from '../lib/services/contacts'
import { useWorkspaceId } from './useWorkspaceId'
import { useSessionId } from './useSessionId'
import { jidToFormatedPhone } from '@/utils/whatsapp'
import { useMemo } from 'react'

export const useGetContact = ({ contactId }: { contactId: string }) => {
  const sessionId = useSessionId()
  const workspaceId = useWorkspaceId()

  const query = useQuery({
      queryKey: ['getContact', contactId],
      queryFn: () => getContact({ id: contactId, workspaceId, sessionId }),
      refetchOnWindowFocus: false,
      staleTime: 1440 * 60 * 1000
    })

  const contact = useMemo(() => {
    if (!query.data) return

    const internalContact = query.data!
    const { name, verifiedName, notify, id } = internalContact
    const displayName = name || verifiedName || notify || jidToFormatedPhone(id)

    return {
      ...internalContact,
     displayName
    }
  }, [query])

  return {
    query,
    contact
  }
}
