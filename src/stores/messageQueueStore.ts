import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SelectedFile } from '@/hooks/useFileSelector'

export type MessageStatus = 'pending' | 'sending' | 'sent' | 'failed'

export interface QueuedMessage {
  id: string
  chatId: string
  sessionId: string
  workspaceId: string
  message: string
  files?: SelectedFile[]
  status: MessageStatus
  createdAt: number
  retryCount: number
  errorMessage?: string
}

interface MessageQueueState {
  queue: QueuedMessage[]
  addToQueue: (message: Omit<QueuedMessage, 'id' | 'status' | 'createdAt' | 'retryCount'>) => string
  updateStatus: (id: string, status: MessageStatus, errorMessage?: string) => void
  removeFromQueue: (id: string) => void
  incrementRetry: (id: string) => void
  getFailedMessages: () => QueuedMessage[]
  getPendingMessages: () => QueuedMessage[]
  clearQueue: () => void
}

export const useMessageQueueStore = create<MessageQueueState>()(
  persist(
    (set, get) => ({
      queue: [],
      
      addToQueue: (message) => {
        const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const queuedMessage: QueuedMessage = {
          ...message,
          id,
          status: 'pending',
          createdAt: Date.now(),
          retryCount: 0,
        }
        set((state) => ({ queue: [...state.queue, queuedMessage] }))
        return id
      },

      updateStatus: (id, status, errorMessage) => {
        set((state) => ({
          queue: state.queue.map((msg) =>
            msg.id === id ? { ...msg, status, errorMessage } : msg
          ),
        }))
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((msg) => msg.id !== id),
        }))
      },

      incrementRetry: (id) => {
        set((state) => ({
          queue: state.queue.map((msg) =>
            msg.id === id ? { ...msg, retryCount: msg.retryCount + 1 } : msg
          ),
        }))
      },

      getFailedMessages: () => {
        return get().queue.filter((msg) => msg.status === 'failed')
      },

      getPendingMessages: () => {
        return get().queue.filter((msg) => msg.status === 'pending')
      },

      clearQueue: () => {
        set({ queue: [] })
      },
    }),
    {
      name: 'message-queue-storage',
      partialize: (state) => ({
        queue: state.queue.filter(msg => msg.status === 'failed' || msg.status === 'pending')
      }),
    }
  )
)
