import { create } from 'zustand'
import { getCounter, incrementCounter } from '@/lib/services/counters'

interface MessageCounterState {
  sentCount: number
  messageLimit: number
  year: number
  month: number
  isLoading: boolean
  workspaceId: string | null
  setWorkspaceId: (workspaceId: string) => void
  fetchCount: () => Promise<void>
  incrementSentCount: () => Promise<void>
  applyNewLimit: (messageLimit: number) => void
}

export const useMessageCounterStore = create<MessageCounterState>()((set, get) => ({
  sentCount: 0,
  messageLimit: 1000,
  year: new Date().getFullYear(),
  month: new Date().getMonth() + 1,
  isLoading: false,
  workspaceId: null,

  setWorkspaceId: (workspaceId: string) => {
    set({ workspaceId })
  },

  fetchCount: async () => {
    const { workspaceId } = get()
    if (!workspaceId) return

    set({ isLoading: true })
    try {
      const data = await getCounter({ workspaceId })
      set({
        sentCount: data.sentCount,
        messageLimit: data.messageLimit,
        year: data.year,
        month: data.month,
        isLoading: false
      })
    } catch {
      set({ isLoading: false })
    }
  },

  incrementSentCount: async () => {
    const { workspaceId, sentCount } = get()
    if (!workspaceId) return

    set({ sentCount: sentCount + 1 })

    try {
      const data = await incrementCounter({ workspaceId })
      if (data) {
        set({
          sentCount: data.sentCount,
          messageLimit: data.messageLimit,
          year: data.year,
          month: data.month
        })
      }
    } catch {
      set({ sentCount: sentCount })
    }
  },

  applyNewLimit: (messageLimit: number) => {
    set({ messageLimit })
  }
}))
