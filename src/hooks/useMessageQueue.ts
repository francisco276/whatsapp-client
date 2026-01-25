import { useCallback, useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { sendMessage } from '@/lib/services/messages'
import { useMessageQueueStore, type QueuedMessage } from '@/stores/messageQueueStore'
import { useMessageCounterStore } from '@/stores/messageCounterStore'

const MAX_RETRIES = 3
const RETRY_DELAY = 5000

export function useMessageQueue() {
  const queryClient = useQueryClient()
  const { 
    queue, 
    addToQueue, 
    updateStatus, 
    removeFromQueue, 
    incrementRetry,
    getFailedMessages,
    getPendingMessages 
  } = useMessageQueueStore()
  const incrementSentCount = useMessageCounterStore((state) => state.incrementSentCount)
  const processingRef = useRef<Set<string>>(new Set())

  const processMessage = useCallback(async (msg: QueuedMessage) => {
    if (processingRef.current.has(msg.id)) return
    processingRef.current.add(msg.id)

    try {
      updateStatus(msg.id, 'sending')
      
      await sendMessage({
        workspaceId: msg.workspaceId,
        sessionId: msg.sessionId,
        chatId: msg.chatId,
        message: msg.message,
        files: msg.files,
      })

      updateStatus(msg.id, 'sent')
      incrementSentCount()
      
      setTimeout(() => {
        removeFromQueue(msg.id)
        queryClient.invalidateQueries({ 
          queryKey: ['messages', msg.sessionId, msg.chatId, msg.workspaceId] 
        })
      }, 1000)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar mensaje'
      
      if (msg.retryCount < MAX_RETRIES) {
        incrementRetry(msg.id)
        updateStatus(msg.id, 'pending', errorMessage)
        
        setTimeout(() => {
          processingRef.current.delete(msg.id)
          processMessage({ ...msg, retryCount: msg.retryCount + 1, status: 'pending' })
        }, RETRY_DELAY * (msg.retryCount + 1))
      } else {
        updateStatus(msg.id, 'failed', errorMessage)
      }
    } finally {
      processingRef.current.delete(msg.id)
    }
  }, [updateStatus, removeFromQueue, incrementRetry, incrementSentCount, queryClient])

  const queueMessage = useCallback((message: {
    chatId: string
    sessionId: string
    workspaceId: string
    message: string
    files?: any[]
  }) => {
    const id = addToQueue(message)
    const msg = useMessageQueueStore.getState().queue.find(m => m.id === id)
    if (msg) {
      processMessage(msg)
    }
    return id
  }, [addToQueue, processMessage])

  const retryMessage = useCallback((id: string) => {
    const msg = queue.find(m => m.id === id)
    if (msg && msg.status === 'failed') {
      updateStatus(id, 'pending')
      useMessageQueueStore.getState().queue.find(m => m.id === id)
      processMessage({ ...msg, status: 'pending', retryCount: 0 })
    }
  }, [queue, updateStatus, processMessage])

  const retryAllFailed = useCallback(() => {
    const failed = getFailedMessages()
    failed.forEach(msg => retryMessage(msg.id))
  }, [getFailedMessages, retryMessage])

  useEffect(() => {
    const pending = getPendingMessages()
    pending.forEach(msg => {
      if (!processingRef.current.has(msg.id)) {
        processMessage(msg)
      }
    })
  }, [])

  return {
    queue,
    queueMessage,
    retryMessage,
    retryAllFailed,
    failedCount: getFailedMessages().length,
    pendingCount: getPendingMessages().length,
  }
}
