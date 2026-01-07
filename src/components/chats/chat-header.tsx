import { Flex, Heading, Icon, Avatar, Badge } from '@vibe/core'
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

  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId  })

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
    <Flex gap={10} className='p-4 border-b! border-x-0 border-slate-200!' align="center">
      <Badge type="indicator" color={isConnected ? "primary" : "negative"} size="small" anchor="bottom-end">
        {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
      </Badge>
      <Flex direction="column" align="start">
        <Heading type='h2' weight='bold'> {contact?.displayName} </Heading>
        <div className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? 'En línea' : 'Desconectado'}
        </div>
      </Flex>
    </Flex>
  )
}
