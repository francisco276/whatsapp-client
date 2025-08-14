import { useState, useEffect, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useContext as useMondayContex } from "@/hooks/useContext"
import { MondayApi } from '@/lib/monday/api'
import { ERROR_LOAD_MESSAGES_HISTORY, ERROR_PHONE_COLUMN_CONFIGURATION } from "@/config/errors"
import { Error } from "@/components/error"
import { getSingleChatInformation } from "@/lib"
import { SingleSettings } from "@/types/monday"
import { EmptyState } from "@/components/empty-state"
import { FullLoader } from "@/components/loading/full-loading"
import Workspace from "@/components/layout/workspace"
import Sessions from "@/components/layout/sessions"
import Chats from "@/components/layout/chats"

const SingleChatPage = () => {
  const [state, setState] = useState({
    phoneColumnId: '',
    error: '',
    sessionId: ''
  })

  const monday = useMemo(() => new MondayApi(), [])
  const { context } = useMondayContex({ monday })
  const { itemId, accountId: workspaceId } = useMemo(() => context, [context])

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


  const { data, isLoading, isError } = useQuery({
    queryKey: ['getItem', itemId],
    queryFn: () => getSingleChatInformation({
      monday,
      workspaceId,
      sessionId: state.sessionId,
      itemId,
      phoneColumnId: state.phoneColumnId
    }),
    enabled: !!state.sessionId,
  })

  if (state.error) {
    return <Error errorMessage={state.error} />
  }

  return (
    <Workspace>
      <Sessions type="small">
        {isError && <Error title={ERROR_LOAD_MESSAGES_HISTORY.title} errorMessage={ERROR_LOAD_MESSAGES_HISTORY.description} />}
        {isLoading && <FullLoader title="Recuperando historial de conversación" description="Estamos recuperando el historial de conversación. Esto puede tardar unos segundos." />}
        {
          (!isError && !isLoading) && (
            < Chats
              enableSidebar={false} chatId={data?.chatId}
              emptyComponent={<EmptyState title="Bienvenido" icon="Update" description="Elige una sesión para ver las conversaciones" iconClassName="text-[#0DACC8]" />}
            />
          )
        }
      </Sessions>
    </Workspace>
  )
}

export default SingleChatPage
