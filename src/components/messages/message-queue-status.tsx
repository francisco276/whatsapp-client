import { useMessageQueueStore, QueuedMessage } from '@/stores/messageQueueStore'
import { Box, Flex, Text, IconButton, Tooltip } from '@vibe/core'
import { Retry, CloseSmall, Time } from '@vibe/icons'
import { useState, useEffect } from 'react'

export const MessageQueueStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const queue = useMessageQueueStore((s) => s.queue)
  const removeFromQueue = useMessageQueueStore((s) => s.removeFromQueue)
  const resetRetryCount = useMessageQueueStore((s) => s.resetRetryCount)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const pendingCount = queue.filter((m: QueuedMessage) => m.status === 'pending' && m.retryCount < 3).length
  const failedCount = queue.filter((m: QueuedMessage) => m.status === 'failed').length

  const retryMessage = (id: string) => {
    resetRetryCount(id)
  }

  const cancelMessage = (id: string) => {
    removeFromQueue(id)
  }

  if (queue.length === 0) return null

  return (
    <Box className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
      <Flex justify="space-between" align="center" className="mb-2">
        <Flex align="center" gap={8}>
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
          <Text type="text2" className="font-medium">
            {isOnline ? 'Conectado' : 'Sin conexión'}
          </Text>
        </Flex>
        {pendingCount > 0 && (
          <Text type="text3" className="text-amber-700">
            {pendingCount} mensaje{pendingCount !== 1 ? 's' : ''} pendiente{pendingCount !== 1 ? 's' : ''}
          </Text>
        )}
      </Flex>

      {queue.map((msg: QueuedMessage) => (
        <Flex key={msg.id} align="center" justify="space-between" className="bg-white rounded p-2 mb-1 border border-amber-100">
          <Flex align="center" gap={8} className="flex-1 min-w-0">
            {msg.status === 'sending' && (
              <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
            )}
            {msg.status === 'pending' && (
              <Time className="text-amber-500 w-4 h-4" />
            )}
            {msg.status === 'failed' && (
              <CloseSmall className="text-red-500 w-4 h-4" />
            )}
            <Text type="text3" className="truncate">
              {msg.message || `${msg.files?.length || 0} archivo(s)`}
            </Text>
          </Flex>

          <Flex gap={4}>
            {msg.status === 'failed' && (
              <Tooltip content="Reintentar">
                <IconButton
                  size="xs"
                  icon={Retry}
                  onClick={() => retryMessage(msg.id)}
                  ariaLabel="Reintentar"
                />
              </Tooltip>
            )}
            <Tooltip content="Cancelar">
              <IconButton
                size="xs"
                icon={CloseSmall}
                onClick={() => cancelMessage(msg.id)}
                ariaLabel="Cancelar"
              />
            </Tooltip>
          </Flex>
        </Flex>
      ))}

      {failedCount > 0 && (
        <Text type="text3" className="text-red-600 mt-2">
          {failedCount} mensaje{failedCount !== 1 ? 's' : ''} fallido{failedCount !== 1 ? 's' : ''}. Haz clic en reintentar.
        </Text>
      )}

      {queue.some((m: QueuedMessage) => m.files && m.files.length > 0) && (
        <Text type="text3" className="text-gray-500 mt-2 italic">
          Nota: Los archivos adjuntos no se guardan si refrescas la página.
        </Text>
      )}
    </Box>
  )
}
