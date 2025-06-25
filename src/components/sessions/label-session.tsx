import { useQuery } from '@tanstack/react-query'
import { getProfile } from '@/lib/services/profile'
import { Flex, Avatar, Loader } from '@vibe/core'
import { PersonRound } from '@vibe/icons'

export const LabelSession = ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  const { data: session, isLoading } = useQuery({
    queryKey: [sessionId],
    queryFn: () => getProfile({ workspaceId, sessionId }),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000,
    enabled: !!workspaceId && !!sessionId
  })

  const Icon = session?.user?.image ? () => <Avatar size="small" type="img" src={session.user?.image} /> : PersonRound

  return (
    <Flex align='center' gap={20} >
      <Icon />
      {isLoading && <Loader size="small" />}
      <span>{session?.user?.name}</span>
    </Flex>
  )
}
