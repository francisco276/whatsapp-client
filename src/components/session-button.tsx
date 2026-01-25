import { useEffect, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Avatar, Flex, Icon, Text, Tooltip, Toast } from '@vibe/core'
import { getProfile } from '../lib/services/profile'
import { PersonRound, Retry } from '@vibe/icons'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { handlerUpdateSession } from '@/lib/socket-handlers/session'
import { SocketClient } from '@/lib/socket'
import { useDebounceCallback } from 'usehooks-ts'
import { jidToFormatedPhone } from '@/utils/whatsapp'
import { WAStatus } from '@/types'
import { reconnectSession } from '@/lib/services/sessions'

type SessionButtonProps = {
  sessionId: string
  isSelected: boolean
  onClick: () => void
  isToggle: boolean
  isSynced: boolean
  status?: WAStatus
}

const getStatusInfo = (status?: WAStatus) => {
  switch (status) {
    case WAStatus.Connected:
      return { color: 'bg-green-500', text: 'Conectado', canReconnect: false }
    case WAStatus.Disconnected:
      return { color: 'bg-red-500', text: 'Desconectado', canReconnect: true }
    case WAStatus.WaitQrcodeAuth:
      return { color: 'bg-yellow-500', text: 'Esperando QR', canReconnect: false }
    case WAStatus.Authenticated:
      return { color: 'bg-blue-500', text: 'Autenticando', canReconnect: false }
    case WAStatus.PullingWAData:
      return { color: 'bg-blue-400', text: 'Sincronizando', canReconnect: false }
    default:
      return { color: 'bg-gray-400', text: 'Desconocido', canReconnect: true }
  }
}

export const SessionButton = ({
  sessionId,
  isSelected,
  onClick,
  isToggle,
  isSynced,
  status
}: SessionButtonProps) => {
  const workspaceId = useWorkspaceId()
  const queryClient = useQueryClient()
  const { data: session, isError, refetch } = useQuery({
    queryKey: [sessionId],
    queryFn: () => getProfile({ workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })
  const [sync, setSync] = useState<boolean>(isSynced)
  const [currentStatus, setCurrentStatus] = useState<WAStatus | undefined>(status)
  const [toast, setToast] = useState<{ type: 'positive' | 'negative', message: string } | null>(null)

  const { mutate: doReconnect, isPending: isReconnecting } = useMutation({
    mutationFn: () => reconnectSession({ workspaceId, sessionId }),
    onSuccess: () => {
      setToast({ type: 'positive', message: 'Sesión reconectada correctamente' })
      setCurrentStatus(WAStatus.Connected)
      queryClient.invalidateQueries({ queryKey: ['sessions', workspaceId] })
      refetch()
    },
    onError: () => {
      setToast({ type: 'negative', message: 'Error al reconectar la sesión. Intenta de nuevo.' })
    }
  })

  const debounceSync = useDebounceCallback((value: boolean) => setSync(value), 500)

  useEffect(() => {
    if (!workspaceId || !sessionId) return

    const socket = new SocketClient({ workspaceId, sessionId })

    handlerUpdateSession(socket, (isSynced) => {
      debounceSync(isSynced)
      refetch()
    })

    return () => {
      socket?.disconnect()
    }
  }, [workspaceId, sessionId])

  useEffect(() => {
    setCurrentStatus(status)
  }, [status])

  if (isError || !session) {
    return null
  }

  const { image, name, id } = session.user
  const displayName = name ?? jidToFormatedPhone(id)
  const statusInfo = getStatusInfo(currentStatus)

  const handleReconnect = (e: React.MouseEvent) => {
    e.stopPropagation()
    doReconnect()
  }

  return (
    <>
      <Button
        kind="secondary"
        className={`w-full border-1! border-[#A3E7F3]! mb-4 ${isToggle ? 'justify-start!' : ''} ${isSelected ? 'bg-[#E8F9FC]!' : ''}`}
        onClick={onClick}
        size='large'
        disabled={sync || isReconnecting}
      >
      <Flex gap={10} align="center" className="w-full">
        <div className="relative">
          {image ? <Avatar size="small" type="img" src={image} /> : <Icon icon={PersonRound} iconSize={32} />}
          <Tooltip content={statusInfo.text}>
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${statusInfo.color} border-2 border-white`} />
          </Tooltip>
        </div>

        {isToggle && (
          <Flex align="center" justify="space-between" className="flex-1 min-w-0">
            <div className="flex-1 min-w-0">
              {!sync && displayName && <Text type='text1' maxLines={1}>{displayName}</Text>}
              {sync && (<span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Sincronizando</span>)}
            </div>

            {statusInfo.canReconnect && !sync && (
              <Tooltip content="Reconectar sesión">
                <button
                  onClick={handleReconnect}
                  disabled={isReconnecting}
                  className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label="Reconectar"
                >
                  {isReconnecting ? (
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon icon={Retry} iconSize={16} className="text-gray-500 hover:text-blue-500" />
                  )}
                </button>
              </Tooltip>
            )}
          </Flex>
        )}

        {!isToggle && statusInfo.canReconnect && (
          <Tooltip content="Reconectar sesión">
            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Reconectar"
            >
              {isReconnecting ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Icon icon={Retry} iconSize={16} className="text-gray-500 hover:text-blue-500" />
              )}
            </button>
          </Tooltip>
        )}
        </Flex>
      </Button>

      {toast && (
        <Toast
          open={!!toast}
          type={toast.type}
          onClose={() => setToast(null)}
          autoHideDuration={3000}
          className="fixed bottom-4 right-4 z-50"
        >
          {toast.message}
        </Toast>
      )}
    </>
  )
}
