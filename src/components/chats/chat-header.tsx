import { Flex, Heading, Icon, Avatar } from '@vibe/core'
import { PersonRound } from '@vibe/icons'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'

export const ChatHeader = () => {
  const chatId = useChatId()

  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId  })

  return (
    <Flex gap={10} className='p-4 border-b! border-x-0 border-slate-200!' >
      {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
      <Heading type='h2' weight='bold'> {contact?.displayName} </Heading>
    </Flex>
  )
}
