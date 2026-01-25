import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'message' | 'error' | 'success' | 'info'
  title: string
  body?: string
  chatId?: string
  sessionId?: string
  timestamp: number
  read: boolean
}

interface NotificationState {
  notifications: Notification[]
  soundEnabled: boolean
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  toggleSound: () => void
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      soundEnabled: true,
      unreadCount: 0,

      addNotification: (notification) => {
        const newNotification: Notification = {
          ...notification,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
        }
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications].slice(0, 100),
          unreadCount: state.unreadCount + 1,
        }))

        if (get().soundEnabled && notification.type === 'message') {
          try {
            const audio = new Audio('/notification.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {})
          } catch {}
        }
      },

      markAsRead: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          if (notification && !notification.read) {
            return {
              notifications: state.notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
              ),
              unreadCount: Math.max(0, state.unreadCount - 1),
            }
          }
          return state
        })
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }))
      },

      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id)
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification && !notification.read 
              ? Math.max(0, state.unreadCount - 1) 
              : state.unreadCount,
          }
        })
      },

      clearNotifications: () => {
        set({ notifications: [], unreadCount: 0 })
      },

      toggleSound: () => {
        set((state) => ({ soundEnabled: !state.soundEnabled }))
      },
    }),
    {
      name: 'notification-storage',
      partialize: (state) => ({
        soundEnabled: state.soundEnabled,
        notifications: state.notifications.slice(0, 20),
      }),
    }
  )
)
