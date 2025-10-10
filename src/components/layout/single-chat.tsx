import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSingleChatInformation } from "@/lib"
import { MondayApi } from '@/lib/monday/api'
import { ERROR_LOAD_MESSAGES_HISTORY } from '@/config/errors'
import { useSessionId } from '@/hooks/useSessionId'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useContext as useMondayContex } from "@/hooks/useContext"
import { FullLoader } from '@/components/loading/full-loading'
import { Error } from '@/components/error'
import { EmptyState } from "@/components/empty-state"
import Chats from '@/components/layout/chats'

type SingleChatProps = {
  phoneColumnId: string
}

export function SingleChat({ phoneColumnId }: SingleChatProps) {
  const monday = new MondayApi()
  const workspaceId = useWorkspaceId()
  const sessionId = useSessionId()

  const { data: context } = useMondayContex()
  const { itemId } = useMemo(() => context ?? { itemId: ''}, [context])
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ['getItem', itemId],
    queryFn: () => getSingleChatInformation({
      monday,
      workspaceId,
      sessionId: sessionId,
      itemId,
      phoneColumnId
    }),
    enabled: !!sessionId && !!sessionId && !!itemId,
  })

  if (isLoading) {
    return <FullLoader title="Recuperando historial de conversación" description="Estamos recuperando el historial de conversación. Esto puede tardar unos segundos." />
  }

  if (isError) {
    return <Error title={ERROR_LOAD_MESSAGES_HISTORY.title} errorMessage={ERROR_LOAD_MESSAGES_HISTORY.description} />
  }

  return (
    <Chats
      enableSidebar={false} chatId={data?.chatId}
      emptyComponent={<EmptyState title="Bienvenido" icon="Update" description="Elige una sesión para ver las conversaciones" iconClassName="text-[#0DACC8]" />}
    />
  )
}