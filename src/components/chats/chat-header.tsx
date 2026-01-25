import { Flex, Icon, Avatar, Box, Text } from '@vibe/core'
import { PersonRound } from '@vibe/icons'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'
import { useEffect, useState } from 'react'

export const ChatHeader = () => {
  const chatId = useChatId()
  const [sentCount, setSentCount] = useState(0)

  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId  })

  useEffect(() => {
    const updateCount = () => {
      setSentCount(parseInt(localStorage.getItem('messages_sent_total_count') || '0'))
    }
    updateCount()
    const interval = setInterval(updateCount, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='border-b! border-x-0 border-slate-200!' style={{ borderBottom: '1px solid #e5e7eb' }}>
      <Box className="px-4 pt-2 text-right">
        <Text type="text3" color="secondary">Total mensajes enviados: {sentCount}</Text>
      </Box>
      <Flex gap={10} className='p-4 pt-2' align="center">
        {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
        <span style={{ fontSize: '1.25rem', fontWeight: 700, color: '#323338', lineHeight: 1.2 }}>{contact?.displayName}</span>
      </Flex>
    </div>
  )
}
