import { ChatContext } from './providers/chat/chat-context'
import { Button, Avatar, Skeleton, Badge, Flex, Text } from '@vibe/core'
import { Comment } from '@vibe/icons'
import { useMemo, useContext } from 'react'
import { unreadChatStore } from '@/stores/unReadChatStore'
import { useGetContact } from '@/hooks/useGetContact'

type ContactItemProps = {
  contactId: string
  isToggle: boolean
}

export const ContactItem = ({ contactId, isToggle }: ContactItemProps) => {
  const unread = unreadChatStore((state) => state.contacts[contactId])
  const { chat, setChat } = useContext(ChatContext)
  const { query, contact } = useGetContact({ contactId })
  const { isLoading } = query

  const isSelected = useMemo(() => chat === contactId, [chat, contactId])

  if (isLoading) {
    return <Skeleton fullWidth={true} height={48} type='rectangle' />
  }

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
      {!isLoading && (contact?.image ? <Avatar size="small" type="img" src={contact?.image} /> : <Avatar size='small' type="icon" icon={Comment} withoutBorder={true} />)}
      {(!isLoading && isToggle && contact?.displayName) && <Text type='text1' maxLines={1}>{contact?.displayName}</Text>}
    </Flex>
  </Button>

  return (
    unread ? <Badge type='counter' count={unread} anchor='top-start'> {button} </Badge> : button
  )
}
