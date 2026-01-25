import { useState } from 'react'
import { Box, Flex, IconButton, Text, Button } from '@vibe/core'
import { Notifications, Sound, Mute } from '@vibe/icons'
import { useNotificationStore } from '@/stores/notificationStore'

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false)
  const { 
    notifications, 
    unreadCount, 
    markAllAsRead, 
    clearNotifications,
    soundEnabled,
    toggleSound 
  } = useNotificationStore()

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return 'Ahora'
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} h`
    return date.toLocaleDateString()
  }

  return (
    <div className="relative">
      <div className="relative">
        <IconButton
          icon={Notifications}
          ariaLabel="Notificaciones"
          onClick={() => {
            setIsOpen(!isOpen)
            if (!isOpen && unreadCount > 0) {
              markAllAsRead()
            }
          }}
        />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <Box className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-hidden">
          <Flex justify="space-between" align="center" className="p-3 border-b">
            <Text type="text1" weight="bold">Notificaciones</Text>
            <Flex gap={4}>
              <IconButton
                icon={soundEnabled ? Sound : Mute}
                size="small"
                ariaLabel={soundEnabled ? 'Silenciar' : 'Activar sonido'}
                onClick={toggleSound}
              />
              {notifications.length > 0 && (
                <Button size="small" kind="tertiary" onClick={clearNotifications}>
                  Limpiar
                </Button>
              )}
            </Flex>
          </Flex>

          <div className="overflow-y-auto max-h-72">
            {notifications.length === 0 ? (
              <Box className="p-6 text-center">
                <Text type="text2" color="secondary">Sin notificaciones</Text>
              </Box>
            ) : (
              notifications.slice(0, 20).map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <Flex justify="space-between" align="start">
                    <div className="flex-1 min-w-0">
                      <Text type="text2" weight="medium" className="truncate">
                        {notification.title}
                      </Text>
                      {notification.body && (
                        <Text type="text3" color="secondary" className="truncate mt-1">
                          {notification.body}
                        </Text>
                      )}
                    </div>
                    <Text type="text3" color="secondary" className="ml-2 whitespace-nowrap">
                      {formatTime(notification.timestamp)}
                    </Text>
                  </Flex>
                </div>
              ))
            )}
          </div>
        </Box>
      )}
    </div>
  )
}
