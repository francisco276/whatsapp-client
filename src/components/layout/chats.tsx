import { Chat } from "@/components/chat"
import { ChatsSidebar } from "@/components/chats-sidebar"
import { ChatProvider } from "@/components/providers/chat/chat-provider"
import { useRegisterNewMessage } from '@/hooks/useRegisterNewMessage'
import { useMondayRegistration } from '@/hooks/useMondayRegistration'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useBoardId } from '@/hooks/useBoardId'
import { getChats } from '@/lib/services/chats'
import { useQuery } from '@tanstack/react-query'
import { useContext, useEffect } from 'react'
import { EmptyState } from '../empty-state'
import { SessionContext } from '../providers/session/session-context'
import { AddSession } from '../add-session'
import { Box } from "@vibe/core"
import { useMessageCounterStore } from '@/stores/messageCounterStore'

type ChatsProps = {
  enableSidebar?: boolean,
  chatId?: string
  emptyComponent?: React.ReactElement
}

export default function Chats({ enableSidebar = true, chatId, emptyComponent: EmptyComponent }: ChatsProps) {
  const workspaceId = useWorkspaceId()
  const boardId = useBoardId()
  const { session } = useContext(SessionContext)
  const { setWorkspaceId, fetchCount } = useMessageCounterStore()

  useEffect(() => {
    const counterId = boardId || workspaceId
    if (counterId) {
      setWorkspaceId(counterId)
      fetchCount()
    }
  }, [boardId, workspaceId, setWorkspaceId, fetchCount])

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getChats', session],
    queryFn: () => getChats({ workspaceId, sessionId: session }),
    enabled: !!session && enableSidebar
  })

  useRegisterNewMessage({ workspaceId, chats: data?.chats ?? [] })
  useMondayRegistration()

  if (!session) {
    return (
      <Box className="flex-1">
        {EmptyComponent === undefined ?
          <EmptyState
            title='Bienvenido'
            description='Selecciona una sesión para ver los contactos o inicia una nueva sesión'
            icon='Update'
            iconClassName="text-[#0DACC8]"
          >
            <AddSession isToggle={true} />
          </EmptyState> : EmptyComponent
        }
      </Box>
    )
  }

  return (
    <ChatProvider chatId={chatId}>
      <>
        {enableSidebar &&
          <ChatsSidebar
            chats={data?.chats ?? []}
            loading={isLoading}
            error={isError}
          />
        }
        <Chat />
      </>
    </ChatProvider>
  )
}
