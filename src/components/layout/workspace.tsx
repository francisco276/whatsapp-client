import { FormWorkspace } from '@/components/form-workspace.tsx'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { WithAuthorization } from '@/components/with-authorization'
import { getWorkspace, joinWorkspace } from '@/lib/services/workspaces.ts'
import { getToken } from '@/lib/services/auth.ts'
import { useQuery } from '@tanstack/react-query'
import { Flex } from '@vibe/core'
import { Error } from '../error'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useContext } from '@/hooks/useContext.ts'

type WorkspaceProps = {
  children: React.ReactNode
}

export default function Workspace({ children }: WorkspaceProps) {
  const workspaceId = useWorkspaceId()
  const { data: context } = useContext()
  const userId = context?.userId ?? ''
  const isAdmin = context?.isAdmin ?? false

  const { isSuccess: tokenSuccess, isError: tokenError } = useQuery({
    queryKey: ['getToken', workspaceId, userId],
    queryFn: async () => {
      console.log('[WS] Obteniendo token...', { workspaceId, userId })
      const result = await getToken({ workspaceId, userId })
      console.log('[WS] Token obtenido OK')
      return result
    },
    enabled: !!workspaceId && !!userId,
    retry: 1,
  })

  const { isSuccess: joinDone, isLoading: joinLoading, isError: joinError } = useQuery({
    queryKey: ['joinWorkspace', workspaceId, userId],
    queryFn: async () => {
      console.log('[WS] Llamando joinWorkspace...', { workspaceId, isAdmin })
      await joinWorkspace({ workspaceId, isAdmin })
      console.log('[WS] joinWorkspace completado')
      return true
    },
    enabled: tokenSuccess && !!workspaceId && !!userId,
  })

  const readyToFetch = joinDone

  console.log('[WS] Estado:', {
    workspaceId,
    userId,
    isAdmin,
    tokenSuccess,
    tokenError,
    joinDone,
    joinLoading,
    joinError,
    readyToFetch,
  })

  const {
    data: workspace,
    isError,
    isLoading: workspaceLoading,
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: async () => {
      console.log('[WS] Cargando workspace...', { workspaceId })
      const result = await getWorkspace({ workspaceId })
      console.log('[WS] Workspace resultado:', result)
      return result
    },
    enabled: !!workspaceId && readyToFetch,
    retry: 2,
  })

  if (!tokenSuccess || (isAdmin && joinLoading)) {
    return <FullLoader title='Cargando información' description='Estamos preparando el entorno de trabajo.' />
  }

  if (workspaceLoading) {
    return <FullLoader title='Cargando información' description='Estamos preparando el entorno de trabajo.' />
  }

  if (isError) {
    return <Error />
  }

  if (!workspace) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center'>
        <FormWorkspace workspaceId={workspaceId} />
      </Flex>
    )
  }

  return (
    <WithAuthorization>
      {children}
    </WithAuthorization>
  )
}
