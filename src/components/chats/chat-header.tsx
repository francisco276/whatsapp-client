import { Flex, Heading, Icon, Avatar } from '@vibe/core'

import { PersonRound } from '@vibe/icons'

import { useQuery } from "@tanstack/react-query"
import { getContact } from "@/lib/services/contacts"
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useSessionId } from '@/hooks/useSessionId'
import { useChatId } from '@/hooks/useChat'

export const ChatHeader = () => {
  const workspaceId = useWorkspaceId()
  const sessionId = useSessionId()
  const chatId = useChatId()

  const { data: contact } = useQuery({
    queryKey: ['getContact', chatId],
    queryFn: () => getContact({ id: chatId, workspaceId, sessionId }),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  return (
    <Flex gap={10} className='p-4 border-b! border-x-0 border-slate-200!' >
      {contact?.image ? <Avatar size="large" type="img" src={contact?.image} /> : <Icon icon={PersonRound} iconSize={48} />}
      <Heading type='h2' weight='bold'> {contact?.name} </Heading>
    </Flex>
  )
}
