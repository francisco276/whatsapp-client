import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useContext as useMondayContex } from "@/hooks/useContext"
import { MondayApi } from '@/lib/monday/api'
import { ERROR_PHONE_COLUMN_CONFIGURATION } from "@/config/errors"
import { Error } from "@/components/error"
import { SessionProvider } from "@/components/providers/session/session-provider"
import { ChatProvider } from "@/components/providers/chat/chat-provider"
import { getSingleChatInformation } from "@/lib"
import { Chat } from "@/components/chat"
import { SingleSettings } from "@/types/monday"
import { DropdownSessions } from "@/components/sessions/dropdown-sessions"
import { Flex, AttentionBox, Loader } from "@vibe/core"
import { Info } from '@vibe/icons'
import { WithAuthorization } from "@/components/with-authorization"
import { WorkspaceProvider } from "@/components/providers/workspace/workspace-provider"

const SingleChatPage = () => {
  const [state, setState] = useState({
    phoneColumnId: '',
    error: '',
    sessionId: ''
  })

  const monday = useMemo(() => new MondayApi(), [])
  const { context } = useMondayContex({ monday })
  const { itemId, accountId: workspaceId, userId } = useMemo(() => context, [context])

  // Get setting from context
  useEffect(() => {
    monday.listen<SingleSettings>('settings', (data) => {
      if (data.data.phoneColumnId !== null) {
        const phoneColumnId = Object.keys(data.data.phoneColumnId!)[0]
        setState(value => ({ ...value, error: '', phoneColumnId }))
      } else {
        setState(value => ({ ...value, error: ERROR_PHONE_COLUMN_CONFIGURATION }))
      }
    })
  }, [])

  // Get item id information
  const { data, isLoading } = useQuery({
    queryKey: ['getItem', itemId],
    queryFn: () => getSingleChatInformation({
      monday,
      workspaceId,
      sessionId: state.sessionId,
      itemId,
      phoneColumnId: state.phoneColumnId
    }),
    enabled: !!state.phoneColumnId && !!itemId && !!state.sessionId,
  })

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <WithAuthorization userId={userId} >
        <SessionProvider>
          <ChatProvider chatId={data?.chatId}>
            <Flex align='stretch' direction="column" className='min-h-screen w-screen'>
              {state.error && <div className="flex justify-center items-center h-screen w-screen px-5"><Error errorMessage={state.error} /></div>}
              {
                !state.error &&
                <Flex justify="end" align="center" className="p-5">
                  <div className="grow">
                    <DropdownSessions workspaceId={workspaceId} changeSession={(sessionId) => setState(value => ({ ...value, sessionId }))} />
                  </div>
                </Flex>
              }
              {(!state.sessionId && !state.error) && <div className="flex justify-center items-center h-screen w-screen px-5">
                <AttentionBox
                  title="Selecciona una cuenta"
                  text="Debes elegir una cuenta para ver el chat"
                  icon={Info}
                />
              </div>
              }
              {isLoading && <Flex align="center" justify="center"><Loader size="medium" /></Flex>}
              {data?.isValid && <Chat workspaceId={workspaceId} />}
            </Flex>
          </ChatProvider>
        </SessionProvider>
      </WithAuthorization>
    </WorkspaceProvider>
  )
}

export default SingleChatPage
