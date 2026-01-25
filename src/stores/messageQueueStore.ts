import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { SelectedFile } from '@/hooks/useFileSelector'

export interface QueuedMessage {
  id: string
  chatId: string
  sessionId: string
  workspaceId: string
  message: string
  files: SelectedFile[]
  createdAt: number
  retryCount: number
  status: 'pending' | 'sending' | 'failed'
  error?: string
}

interface MessageQueueState {
  queue: QueuedMessage[]
  isOnline: boolean
  isProcessing: boolean
  addToQueue: (message: Omit<QueuedMessage, 'id' | 'createdAt' | 'retryCount' | 'status'>) => string
  removeFromQueue: (id: string) => void
  updateMessageStatus: (id: string, status: QueuedMessage['status'], error?: string) => void
  incrementRetry: (id: string) => void
  resetRetryCount: (id: string) => void
  setOnline: (online: boolean) => void
  setProcessing: (processing: boolean) => void
  getPendingMessages: () => QueuedMessage[]
  clearQueue: () => void
}

const MAX_RETRIES = 3

export const useMessageQueueStore = create<MessageQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: navigator.onLine,
      isProcessing: false,

      addToQueue: (message) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const queuedMessage: QueuedMessage = {
          ...message,
          id,
          createdAt: Date.now(),
          retryCount: 0,
          status: 'pending'
        }
        set((state) => ({
          queue: [...state.queue, queuedMessage]
        }))
        return id
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((msg) => msg.id !== id)
        }))
      },

      updateMessageStatus: (id, status, error) => {
        set((state) => ({
          queue: state.queue.map((msg) =>
            msg.id === id ? { ...msg, status, error } : msg
          )
        }))
      },

      incrementRetry: (id) => {
        set((state) => ({
          queue: state.queue.map((msg) =>
            msg.id === id ? { ...msg, retryCount: msg.retryCount + 1 } : msg
          )
        }))
      },

      resetRetryCount: (id) => {
        set((state) => ({
          queue: state.queue.map((msg) =>
            msg.id === id ? { ...msg, retryCount: 0, status: 'pending' as const, error: undefined } : msg
          )
        }))
      },

      setOnline: (online) => {
        set({ isOnline: online })
      },

      setProcessing: (processing) => {
        set({ isProcessing: processing })
      },

      getPendingMessages: () => {
        return get().queue.filter(
          (msg) => msg.status === 'pending' && msg.retryCount < MAX_RETRIES
        )
      },

      clearQueue: () => {
        set({ queue: [] })
      }
    }),
    {
      name: 'message-queue-storage',
      partialize: (state) => ({
        queue: state.queue.map(msg => ({
          ...msg,
          files: []
        }))
      })
    }
  )
)
