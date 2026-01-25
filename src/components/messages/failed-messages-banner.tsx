import { Box, Button, Flex, Text } from '@vibe/core'
import { useMessageQueue } from '@/hooks/useMessageQueue'

export function FailedMessagesBanner() {
  const { failedCount, retryAllFailed } = useMessageQueue()

  if (failedCount === 0) return null

  return (
    <Box className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
      <Flex align="center" justify="space-between">
        <Flex align="center" gap={8}>
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <Text type="text2" className="text-red-700">
            {failedCount} mensaje{failedCount > 1 ? 's' : ''} no se pudo enviar
          </Text>
        </Flex>
        <Button
          size="small"
          kind="tertiary"
          onClick={retryAllFailed}
          className="text-red-600 hover:bg-red-100"
        >
          Reintentar
        </Button>
      </Flex>
    </Box>
  )
}
