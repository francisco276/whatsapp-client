import { useQuery } from '@tanstack/react-query'
import { Button, Avatar } from '@vibe/core'
import { getProfile } from '../lib/services/profile'
import { PersonRound } from '@vibe/icons'

type SessionButtonProps = {
  workspaceId: string
  sessionId: string
  isSelected: boolean
  onClick: () => void
  isToggle: boolean
}

export const SessionButton = ({
  workspaceId,
  sessionId,
  isSelected,
  onClick,
  isToggle
}: SessionButtonProps) => {
  const { data: session } = useQuery({
    queryKey: [sessionId],
    queryFn: () => getProfile({ workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  const Icon = session?.user?.image ? () => <Avatar size="small" className={!isToggle ? '!size-4 !px-0' : ''} type="img" src={session.user?.image} /> : PersonRound
  return (
    <Button
      kind='secondary'
      leftIcon={Icon}
      onClick={onClick}
      className={`w-full flex items-center gap-2 p-2 mt-2 rounded ${isSelected ? '!bg-blue-600 !text-neutral-50 !font-black' : 'hover:bg-gray-700'
        }`}
    >
      {isToggle && <span>{session?.user?.name}</span>}
    </Button>
  )
}
