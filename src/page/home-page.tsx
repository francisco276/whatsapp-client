import { Box, Flex, Loader } from '@vibe/core'
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
import { getWorkspace } from '../lib/services/workspaces.ts'
import { FormWorkspace } from '../components/form-workspace.tsx'
import { WithAuthorization } from '@/components/with-authorization.tsx'
import { WorkspaceProvider } from '@/components/providers/workspace/workspace-provider.tsx'


export default function HomePage() {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { workspaceId, userId } = context

  const {
    isError: isErrorWorkspace,
    isLoading: isLoadingWorkspace
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: () => getWorkspace({ workspaceId }),
  })

  const {
    data,
    isError,
    isLoading
  } = useQuery({
    queryKey: ['getSessions', workspaceId],
    queryFn: () => getSessions({ workspaceId }),
    enabled: !!workspaceId,
  })

  if (isLoadingWorkspace) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
        <Loader size="large" />
      </Flex>
    )
  }

  if (isErrorWorkspace) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
        <FormWorkspace workspaceId={workspaceId} />
      </Flex>
    )
  }

  return (
    <>
      <WorkspaceProvider workspaceId={workspaceId}>
        <WithAuthorization userId={userId}>
          <Flex className='w-screen h-screen' justify='center' align='center' >
            <SessionProvider>
              <Box>
                <Flex align='stretch' className='min-h-screen w-screen'>
                  <SessionSidebar
                    sessions={data?.sessions || []}
                    isLoading={isLoading}
                    error={isError}
                  />
                  {isError && <Flex align='center' justify='center' className='mx-auto' ><Error errorMessage={ERROR_SERVER_ERROR} /></Flex>}

                  {(!isError && !isLoading) &&
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
          </Flex>
        </WithAuthorization>
      </WorkspaceProvider>

    </>
  )
}
