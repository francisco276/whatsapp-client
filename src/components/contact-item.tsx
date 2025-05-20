import { useQuery } from '@tanstack/react-query'
import { SessionContext } from './providers/session/session-context'
import { ChatContext } from './providers/chat/chat-context'
import { getContact } from '../lib/services/contacts'

import { Button, Avatar, Skeleton } from '@vibe/core'
import { Comment } from '@vibe/icons'
import { useMemo, useContext } from 'react'

type ContactItemProps = {
  contactId: string
  isToggle: boolean
  workspaceId: string
}

export const ContactItem = ({ contactId, isToggle, workspaceId }: ContactItemProps) => {
  const { session: sessionId } = useContext(SessionContext)
  const { chat, setChat } = useContext(ChatContext)
  const { data: contact, isLoading } = useQuery({
    queryKey: ['getContact', contactId],
    queryFn: () => getContact({ id: contactId, workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  const isSelected = useMemo(() => chat === contactId, [chat, contactId])
  const Icon = useMemo(() => {
    if (isLoading) {
      return () => (<Skeleton type="circle" size='small' className={!isToggle ? '!size-4 !px-0' : ''} />)
    }
    return contact?.image ? () => (<div className='min-w-[28px]'><Avatar className={!isToggle ? '!size-4 !px-0' : ''} size="small" type="img" src={contact.image} withoutBorder={true} /></div>) : Comment
  }, [isLoading, contact, isToggle])

  return (
    <Button
      className={`!w-full rounded !flex !justify-start !overflow-clip ${isSelected ? '!bg-blue-100' : '!hover:bg-gray-200'
        }`}
      kind='secondary'
      leftIcon={Icon}
      onClick={() => {
        setChat(contactId)
      }}
    >
      {
        isToggle && <span className='text-left pl-2'>{contact?.name || contact?.verifiedName || contact?.notify}</span>
      }
    </Button>
  )
}
