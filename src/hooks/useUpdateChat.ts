import { useEffect, useMemo, useRef } from 'react'
import { SocketClient } from '@/lib/socket'
import { useQueryClient } from '@tanstack/react-query'

export const useUpdateChat = ({ workspaceId, chatId, sessionId }: { workspaceId: string, chatId: string, sessionId: string }) => {
  const socket = useMemo(() => new SocketClient({ workspaceId, sessionId }), [workspaceId, sessionId]) 
  const queryClient = useQueryClient()
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const invalidate = () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['messages', sessionId, chatId, workspaceId] })
      }, 500)
    }

    socket.on('messages.upsert', (event) => {
      if (event.data && 'status' in event.data && event.data.status === 'success') {
        console.log('[Socket] messages.upsert received, refreshing chat')
        invalidate()
      }
    })

    socket.on('chats.upsert', (event) => {
      if (event.data && 'status' in event.data && event.data.status === 'success') {
        const data = event.data as { data?: { id?: string }; status: string }
        if (data.data?.id === chatId) {
          console.log('[Socket] chats.upsert for current chat, refreshing')
          invalidate()
        }
      }
    })

    socket.on('chats.update', (event) => {
      if (event.data && 'status' in event.data && event.data.status === 'success') {
        const data = event.data as { data?: { chats?: { id?: string } }; status: string }
        if (data.data?.chats?.id === chatId) {
          console.log('[Socket] chats.update for current chat, refreshing')
          invalidate()
        }
      }
    })

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      socket?.disconnect()
    }
  }, [socket, chatId, sessionId, workspaceId, queryClient])
}
