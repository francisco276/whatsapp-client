import { create } from 'zustand'

type UnreadChatStoreState = {
  contacts: { [id: string]: number }
  setInitialData: (id: string, value: number) => void
  incrementUnreadChat: (id: string) => void
  resetUnreadChat: (id: string) => void
}

export const unreadChatStore = create<UnreadChatStoreState>()((set) => ({
  contacts: {},
  setInitialData: (id: string, value: number) => set((state) => ({ contacts: { ...state.contacts, [id]: value } })),
  incrementUnreadChat: (id: string) => set((state) => ({ contacts: { ...state.contacts, [id]: (state.contacts[id] || 0) + 1 } })),
  resetUnreadChat: (id: string) => set((state) => ({ contacts: { ...state.contacts, [id]: 0 } }))
}))
