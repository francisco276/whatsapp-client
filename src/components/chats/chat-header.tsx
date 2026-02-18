import { Flex, Icon, Avatar, Box, Text } from '@vibe/core'
import { PersonRound } from '@vibe/icons'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'
import { useMessageCounterStore } from '@/stores/messageCounterStore'

export const ChatHeader = () => {
  const chatId = useChatId()
  const sentCount = useMessageCounterStore((state) => state.sentCount)

  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId  })

  return (
    <div className='border-b! border-x-0' style={{ borderBottom: '1px solid var(--ui-border-color)' }}>
      <Box className="px-4 pt-2 text-right">
        <Text type="text3" color="secondary">Total mensajes enviados: {sentCount}</Text>
      </Box>
      <Flex gap={10} className='p-4 pt-2' align="center">
        {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
        <Text type="text1" weight="bold" className="text-lg!">{contact?.displayName}</Text>
      </Flex>
    </div>
  )
}
