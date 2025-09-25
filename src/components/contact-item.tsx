import { useQuery } from '@tanstack/react-query'
import { SessionContext } from './providers/session/session-context'
import { ChatContext } from './providers/chat/chat-context'
import { getContact } from '../lib/services/contacts'

import { Button, Avatar, Skeleton, Badge } from '@vibe/core'
import { Comment } from '@vibe/icons'
import { useMemo, useContext } from 'react'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { jidToFormatedPhone } from '@/utils/whatsapp'

type ContactItemProps = {
  contactId: string
  isToggle: boolean
  workspaceId: string
}

export const ContactItem = ({ contactId, isToggle, workspaceId }: ContactItemProps) => {
  const unread = unreadChatStore((state) => state.contacts[contactId])
  const { session: sessionId } = useContext(SessionContext)
  const { chat, setChat } = useContext(ChatContext)
  const { data: contact, isLoading } = useQuery({
    queryKey: ['getContact', contactId],
    queryFn: () => getContact({ id: contactId, workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  const isSelected = useMemo(() => chat === contactId, [chat, contactId])

  if (!contact) {
    return null
  }

  const { image, name, verifiedName, notify, id } = contact
  const displayName = name || verifiedName || notify || jidToFormatedPhone(id)

  const button = <Button
    className={`w-full border-1! border-[#A3E7F3]! ${isToggle ? 'justify-start!' : ''}  ${isSelected ? 'bg-[#E8F9FC]!' : ''}`}
    size='large'
    kind='secondary'
    onClick={() => {
      setChat(contactId)
    }}
  >
    <Flex gap={10} justify='start'>
      {isLoading && <Skeleton type="circle" size="p" />}
      {!isLoading && (image ? <Avatar size="small" type="img" src={image} /> : <Avatar size='small' type="icon" icon={Comment} withoutBorder={true} />)}
      {(!isLoading && isToggle && displayName) && <Text type='text1' maxLines={1}>{displayName}</Text>}
    </Flex>
  </Button>

  return (
    unread ? <Badge type='counter' count={unread} anchor='top-start'> {button} </Badge> : button
  )
}
