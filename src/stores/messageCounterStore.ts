import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface MessageCounterState {
  sentCount: number
  incrementSentCount: () => void
  resetCount: () => void
}

export const useMessageCounterStore = create<MessageCounterState>()(
  persist(
    (set) => ({
      sentCount: 0,
      incrementSentCount: () => set((state) => ({ sentCount: state.sentCount + 1 })),
      resetCount: () => set({ sentCount: 0 }),
    }),
    {
      name: 'message-counter-storage',
    }
  )
)
