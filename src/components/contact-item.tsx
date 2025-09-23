import { useQuery, useMutation } from '@tanstack/react-query'
import { SessionContext } from './providers/session/session-context'
import { ChatContext } from './providers/chat/chat-context'
import { getContact } from '../lib/services/contacts'

import { Button, Avatar, Skeleton, Badge } from '@vibe/core'
import { Comment } from '@vibe/icons'
import { useMemo, useContext } from 'react'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { updateReadChat } from '@/lib/services/chats'
import { jidToFormatedPhone } from '@/utils/whatsapp'

type ContactItemProps = {
  contactId: string
  isToggle: boolean
  workspaceId: string
}

export const ContactItem = ({ contactId, isToggle, workspaceId }: ContactItemProps) => {
  const unread = unreadChatStore((state) => state.contacts[contactId])
  const resetChat = unreadChatStore((state) => state.resetUnreadChat)
  const { session: sessionId } = useContext(SessionContext)
  const { chat, setChat } = useContext(ChatContext)
  const { data: contact, isLoading } = useQuery({
    queryKey: ['getContact', contactId],
    queryFn: () => getContact({ id: contactId, workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  const { mutate } = useMutation({
    mutationFn: updateReadChat
  })

  const isSelected = useMemo(() => chat === contactId, [chat, contactId])


  const button = <Button
    className={`w-full border-1! border-[#A3E7F3]! ${isToggle ? 'justify-start!' : ''}  ${isSelected ? 'bg-[#E8F9FC]!' : ''}`}
    size='large'
    kind='secondary'
    onClick={() => {
      setChat(contactId)
      if (unread) {
        resetChat(contactId)
        mutate({ id: contactId, workspaceId, sessionId })
      }
    }}
  >
    <div className='ml-2 w-[50%] flex-auto'>
      {
        isToggle && <p className='truncate text-left'>{contact?.name || contact?.verifiedName || contact?.notify || jidToFormatedPhone(contact?.id)}</p>
      }
    </div>

  </Button>

  return (
    unread ? <Badge type='counter' count={unread} anchor='top-start'> {button} </Badge> : button
  )
}
