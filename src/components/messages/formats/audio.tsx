import { Flex, Loader } from '@vibe/core'

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const MessageAudioComponent = ({
  url,
  duration,
  isLoading
}: { url?: string, duration?: number, isLoading?: boolean }) => {
  if (isLoading) {
    return (
      <Flex align="center" gap={8} className="py-2">
        <Loader size="small" />
        <span className="text-sm opacity-70">Cargando audio...</span>
      </Flex>
    )
  }

  if (!url) {
    return (
      <Flex align="center" gap={8} className="py-2">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          <line x1="12" y1="19" x2="12" y2="23"/>
        </svg>
        <span className="text-sm opacity-70">
          Nota de voz {duration ? `(${formatDuration(duration)})` : ''}
        </span>
      </Flex>
    )
  }

  return (
    <Flex align="center" className="py-1 min-w-[200px]">
      <audio
        src={url}
        controls
        controlsList="nodownload"
        className="h-10 w-full max-w-[260px]"
      />
    </Flex>
  )
}
