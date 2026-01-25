import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getSingleChatInformationAutoDetect } from "@/lib"
import { MondayApi } from '@/lib/monday/api'
import { ERROR_LOAD_MESSAGES_HISTORY } from '@/config/errors'
import { useSessionId } from '@/hooks/useSessionId'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useContext as useMondayContex } from "@/hooks/useContext"
import { FullLoader } from '@/components/loading/full-loading'
import { Error } from '@/components/error'
import { EmptyState } from "@/components/empty-state"
import Chats from '@/components/layout/chats'
import { ValidationError } from '@/errors/PublicError'

export function SingleChat() {
  const monday = new MondayApi()
  const workspaceId = useWorkspaceId()
  const sessionId = useSessionId()

  const { data: context } = useMondayContex()
  const itemId = useMemo(() => context?.itemId ?? '', [context])
  
  console.log('[SingleChat] Debug values:', { sessionId, workspaceId, itemId, contextData: context })
  
  const queryEnabled = !!sessionId && !!workspaceId && !!itemId
  console.log('[SingleChat] Query enabled:', queryEnabled)
  
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getItem', itemId, sessionId],
    queryFn: async () => {
      console.log('[SingleChat] Query executing with:', { sessionId, workspaceId, itemId })
      const result = await getSingleChatInformationAutoDetect({
        monday,
        workspaceId,
        sessionId,
        itemId
      })
      console.log('[SingleChat] Query result:', result)
      return result
    },
    enabled: queryEnabled,
    retry: 1,
  })

  if (!sessionId) {
    return (
      <Chats
        enableSidebar={false}
        emptyComponent={
          <EmptyState title="Bienvenido" icon="Update" description="Selecciona una sesión de WhatsApp" iconClassName="text-[#0DACC8]" />
        }
      />
    )
  }

  if (isLoading) {
    return <FullLoader title="Recuperando historial de conversación" description="Estamos recuperando el historial de conversación. Esto puede tardar unos segundos." />
  }

  if (isError) {
    console.error('SingleChat error:', error)
    if (error instanceof ValidationError) {
      return <Error title={error.title} errorMessage={error.description} />
    }

    return <Error title={ERROR_LOAD_MESSAGES_HISTORY.title} errorMessage={ERROR_LOAD_MESSAGES_HISTORY.description} />
  }

  if (data && !data.isValid) {
    return (
      <Chats
        enableSidebar={false}
        emptyComponent={
          <EmptyState 
            title="Chat no encontrado" 
            icon="NoColor" 
            description="No se encontró un chat de WhatsApp para este número de teléfono. Verifica que el número sea correcto y que exista una conversación previa." 
            iconClassName="text-orange-500" 
          />
        }
      />
    )
  }

  return (
    <Chats
      enableSidebar={false} chatId={data?.chatId}
      emptyComponent={
        <EmptyState title="Bienvenido" icon="Update" description="Selecciona una sesión de WhatsApp" iconClassName="text-[#0DACC8]" />
      }
    />
  )
}