import { Chat } from "@/components/chat"
import { ChatsSidebar } from "@/components/chats-sidebar"
import { ChatProvider } from "@/components/providers/chat/chat-provider"
import { useRegisterNewMessage } from '@/hooks/useRegisterNewMessage'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { getChats } from '@/lib/services/chats'
import { useQuery } from '@tanstack/react-query'
import { useContext } from 'react'
import { EmptyState } from '../empty-state'
import { SessionContext } from '../providers/session/session-context'
import { Box } from "@vibe/core"

type ChatsProps = {
  enableSidebar?: boolean,
  chatId?: string
  emptyComponent?: React.ReactElement
}

export default function Chats({ enableSidebar = true, chatId, emptyComponent: EmptyComponent }: ChatsProps) {
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['getChats', session],
    queryFn: () => getChats({ workspaceId, sessionId: session }),
    enabled: !!session && enableSidebar
  })

  useRegisterNewMessage({ workspaceId, chats: data?.chats ?? [] })

  if (!session) {
    return (
      <Box className="flex-1">
        {EmptyComponent === undefined ?
          <EmptyState
            title='Bienvenido'
            description='Selecciona una sesion para ver los contactos'
            icon='Update'
            iconClassName="text-[#0DACC8]"
          /> : EmptyComponent
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
