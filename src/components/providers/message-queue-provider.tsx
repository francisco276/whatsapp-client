import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMessageQueueStore } from '@/stores/messageQueueStore'
import { sendMessage } from '@/lib/services/messages'
import { useMessageCounterStore } from '@/stores/messageCounterStore'

const RETRY_DELAY = 5000
const MAX_RETRIES = 3

export const MessageQueueProvider = ({ children }: { children: React.ReactNode }) => {
  const queryClient = useQueryClient()
  const processingRef = useRef(false)
  const incrementSentCount = useMessageCounterStore((state) => state.incrementSentCount)

  const queue = useMessageQueueStore((s) => s.queue)
  const isOnline = useMessageQueueStore((s) => s.isOnline)
  const setOnline = useMessageQueueStore((s) => s.setOnline)
  const removeFromQueue = useMessageQueueStore((s) => s.removeFromQueue)
  const updateMessageStatus = useMessageQueueStore((s) => s.updateMessageStatus)
  const incrementRetry = useMessageQueueStore((s) => s.incrementRetry)
  const getPendingMessages = useMessageQueueStore((s) => s.getPendingMessages)

  useEffect(() => {
    const handleOnline = () => {
      console.log('[MessageQueue] Back online, processing queue...')
      setOnline(true)
    }

    const handleOffline = () => {
      console.log('[MessageQueue] Gone offline')
      setOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setOnline(navigator.onLine)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  const processQueue = useCallback(async () => {
    if (processingRef.current || !isOnline) return

    const pendingMessages = getPendingMessages()
    if (pendingMessages.length === 0) return

    processingRef.current = true
    console.log(`[MessageQueue] Processing ${pendingMessages.length} pending messages...`)

    for (const message of pendingMessages) {
      try {
        updateMessageStatus(message.id, 'sending')

        await sendMessage({
          chatId: message.chatId,
          sessionId: message.sessionId,
          workspaceId: message.workspaceId,
          message: message.message,
          files: message.files
        })

        removeFromQueue(message.id)
        incrementSentCount()

        queryClient.invalidateQueries({
          queryKey: ['messages', message.sessionId, message.chatId, message.workspaceId]
        })

        console.log(`[MessageQueue] Message ${message.id} sent successfully`)
      } catch (error) {
        console.error(`[MessageQueue] Failed to send message ${message.id}:`, error)
        incrementRetry(message.id)

        if (message.retryCount + 1 >= MAX_RETRIES) {
          updateMessageStatus(message.id, 'failed', 'Máximo de reintentos alcanzado')
        } else {
          updateMessageStatus(message.id, 'pending', 'Reintentando...')
        }
      }
    }

    processingRef.current = false
  }, [isOnline, getPendingMessages, updateMessageStatus, removeFromQueue, incrementRetry, incrementSentCount, queryClient])

  useEffect(() => {
    if (isOnline) {
      processQueue()
    }
  }, [isOnline, processQueue])

  useEffect(() => {
    if (!isOnline) return

    const interval = setInterval(() => {
      const pending = getPendingMessages()
      if (pending.length > 0 && !processingRef.current) {
        processQueue()
      }
    }, RETRY_DELAY)

    return () => clearInterval(interval)
  }, [isOnline, getPendingMessages, processQueue])

  useEffect(() => {
    if (queue.length > 0) {
      console.log(`[MessageQueue] Queue has ${queue.length} messages`)
    }
  }, [queue.length])

  return <>{children}</>
}
