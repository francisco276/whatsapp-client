import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Avatar, Flex, Icon, Text } from '@vibe/core'
import { getProfile } from '../lib/services/profile'
import { PersonRound } from '@vibe/icons'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { handlerUpdateSession } from '@/lib/socket-handlers/session'
import { SocketClient } from '@/lib/socket'
import { useDebounceCallback } from 'usehooks-ts'

type SessionButtonProps = {
  sessionId: string
  isSelected: boolean
  onClick: () => void
  isToggle: boolean
  isSynced: boolean
}

export const SessionButton = ({
  sessionId,
  isSelected,
  onClick,
  isToggle,
  isSynced
}: SessionButtonProps) => {
  const workspaceId = useWorkspaceId()
  const { data: session, isError, refetch } = useQuery({
    queryKey: [sessionId],
    queryFn: () => getProfile({ workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })
  const [sync, setSync] = useState<boolean>(isSynced)

  const debounceSync = useDebounceCallback((value: boolean) => setSync(value), 15000)

  useEffect(() => {
    const socket = new SocketClient({ workspaceId, sessionId })

    handlerUpdateSession(socket, (isSynced) => {
      debounceSync(isSynced)
      refetch()
    })

    return () => {
      socket?.disconnect()
    }
  }, [])

  if (isError || !session) {
    return null
  }

  const { image, name } = session.user

  return (
    <Button
      kind="secondary"
      className={`w-full border-1! border-[#A3E7F3]! ${isToggle ? 'justify-start!' : ''} ${isSelected ? 'bg-[#E8F9FC]!' : ''}`}
      onClick={onClick}
      size='large'
      disabled={sync}
    >
      <Flex gap={10} >
        {image ? <Avatar size="small" type="img" src={image} /> : <Icon icon={PersonRound} iconSize={32} />}
        {(isToggle && !sync && name) && <Text type='text1' maxLines={1}>{name}</Text>}
        {isToggle && sync && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full"> Sincronizando </span>)}
      </Flex>
    </Button>
  )
}
