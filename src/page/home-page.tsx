import { Box, Flex } from '@vibe/core'
import { SessionSidebar } from '../components/sessions-sidebar'
import { ChatsSidebar } from '../components/chats-sidebar'
import { Chat } from '../components/chat'
import { useQuery } from '@tanstack/react-query'
import { getSessions } from '../lib/services/sessions'
import { SessionProvider } from '../components/providers/session/session-provider'
import { ChatProvider } from '../components/providers/chat/chat-provider'
import { useContext } from '../hooks/useContext.ts'
import { MondayApi } from '../lib/monday/api'
import { Error } from '../components/error'
import { ERROR_SERVER_ERROR } from '../config/errors'

export default function HomePage() {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { workspaceId } = context

  const {
    data,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['getSessions'],
    queryFn: () => getSessions({ workspaceId }),
    enabled: !!workspaceId,
  })

  return (
    <SessionProvider>
      <Box>
        <Flex align='stretch' className='min-h-screen'>
          <SessionSidebar
            workspaceId={workspaceId}
            sessions={data?.sessions || []}
            isLoading={isLoading}
            error={isError}
          />
          {isError && <Flex align='center' justify='center' className='mx-auto' ><Error errorMessage={ERROR_SERVER_ERROR} /></Flex>}
          {
            (!isError && !isLoading) &&
            (
              <ChatProvider>
                <>
                  <ChatsSidebar workspaceId={workspaceId} />
                  <Chat workspaceId={workspaceId} />
                </>
              </ChatProvider>
            )
          }
        </Flex>
      </Box>
    </SessionProvider>
  )
}
