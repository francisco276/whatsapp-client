import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Avatar } from '@vibe/core'
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
  const { data: session } = useQuery({
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
    })

    return () => {
      socket?.disconnect()
    }
  }, [])

  const Icon = session?.user?.image ? () => <Avatar size="small" className={!isToggle ? '!size-4 !px-0' : ''} type="img" src={session.user?.image} /> : PersonRound
  return (
    <Button
      kind='secondary'
      leftIcon={Icon}
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-2 mt-2 rounded ${isSelected ? '!bg-blue-600 !text-neutral-50 !font-black' : 'hover:bg-gray-700'
        }`}
      disabled={sync}
    >
      {isToggle && !sync && <span>{session?.user?.name}</span>}
      {isToggle && sync && (
        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
          Sincronizando
        </span>
      )}
    </Button>
  )
}
