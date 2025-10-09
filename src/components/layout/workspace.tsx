import { FormWorkspace } from '@/components/form-workspace.tsx'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { WithAuthorization } from '@/components/with-authorization'
import { getWorkspace } from '@/lib/services/workspaces.ts'
import { useQuery } from '@tanstack/react-query'
import { Flex } from '@vibe/core'
import { Error } from '../error'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'

type WorkspaceProps = {
  children: React.ReactNode
}

export default function Workspace({ children }: WorkspaceProps) {
  const workspaceId = useWorkspaceId()

  const {
    data: workspace,
    isError,
    isLoading,
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: () => getWorkspace({ workspaceId }),
    enabled: !!workspaceId,
    retry: 2,
  })

  if (isLoading) {
    return <FullLoader title='Cargando información' description='Estamos preparando el entorno de trabajo.' />
  }

  if (isError) {
    return (
      <Error />
    )
  }

  if (!workspace) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
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
