import { Flex, Icon, Avatar, Badge, Box, Text } from '@vibe/core'
import { PersonRound } from '@vibe/icons'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'
import { useEffect, useState, useContext } from 'react'
import { SocketClient } from '@/lib/socket'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { SessionContext } from '@/components/providers/session/session-context'

export const ChatHeader = () => {
  const chatId = useChatId()
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const [isConnected, setIsConnected] = useState(false)
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

  useEffect(() => {
    if (!workspaceId || !session) return
    const socket = new SocketClient({ workspaceId, sessionId: session })
    
    socket.onConnect(() => setIsConnected(true))
    socket.onDisconnect(() => setIsConnected(false))
    setIsConnected(socket.isConnected())

    return () => {
      socket.disconnect()
    }
  }, [workspaceId, session])

  return (
    <div className='border-b! border-x-0 border-slate-200!'>
      <Box className="px-4 pt-2 text-right">
        <Text type="text3" color="secondary">Total mensajes enviados: {sentCount}</Text>
      </Box>
      <Flex gap={10} className='p-4 pt-2' align="center">
        <Badge type="indicator" color={isConnected ? "notification" : "notification"} anchor="bottom-end">
          {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
        </Badge>
        <Flex direction="column" align="start">
          <h2 className="text-xl font-bold text-[#323338]!" style={{ color: '#323338' }}>{contact?.displayName}</h2>
          <div className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
            {isConnected ? 'En línea' : 'Desconectado'}
          </div>
        </Flex>
      </Flex>
    </div>
  )
}
