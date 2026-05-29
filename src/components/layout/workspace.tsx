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

  const { isSuccess: tokenSuccess } = useQuery({
    queryKey: ['getToken', workspaceId, userId],
    queryFn: () => getToken({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId,
    retry: 1,
  })

  const { isSuccess: joinDone, isLoading: joinLoading } = useQuery({
    queryKey: ['joinWorkspace', workspaceId, userId],
    queryFn: () => joinWorkspace({ workspaceId, isAdmin }),
    enabled: tokenSuccess && isAdmin && !!workspaceId,
  })

  const readyToFetch = isAdmin ? joinDone : tokenSuccess

  const {
    data: workspace,
    isError,
    isLoading: workspaceLoading,
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: () => getWorkspace({ workspaceId }),
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
