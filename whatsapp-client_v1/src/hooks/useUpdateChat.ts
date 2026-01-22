import { useEffect, useMemo } from 'react'
import { SocketClient } from '@/lib/socket'
import { handlerNotifyMessage } from '@/lib/socket-handlers/messages'
import { useQueryClient } from '@tanstack/react-query'

export const useUpdateChat = ({ workspaceId, chatId, sessionId }: { workspaceId: string, chatId: string, sessionId: string }) => {
  const socket = useMemo(() => new SocketClient({ workspaceId, sessionId }), [workspaceId, sessionId]) 
  const queryClient = useQueryClient()

  handlerNotifyMessage(socket, ({ id }) => {
    if (chatId === id) {
      queryClient.invalidateQueries({ queryKey: ['messages', sessionId, chatId, workspaceId] })
    }
  })

  useEffect(() => {
    return () => {
      socket?.disconnect()
    }
  }, [socket])
}
