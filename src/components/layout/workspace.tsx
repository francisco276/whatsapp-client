import { FormWorkspace } from '@/components/form-workspace.tsx'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { UserProvider } from '@/components/providers/user/user-provider.tsx'
import { WorkspaceProvider } from '@/components/providers/workspace/workspace-provider.tsx'
import { WithAuthorization } from '@/components/with-authorization.tsx'
import { useContext } from '@/hooks/useContext.ts'
import { MondayApi } from '@/lib/monday/api'
import { getWorkspace } from '@/lib/services/workspaces.ts'
import { useQuery } from '@tanstack/react-query'
import { Flex } from '@vibe/core'

type WorkspaceProps = {
  children: React.ReactNode
}

export default function Workspace({ children }: WorkspaceProps) {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { userId, accountId: workspaceId } = context

  const {
    isError,
    isLoading
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: () => getWorkspace({ workspaceId }),
    enabled: !!workspaceId,
  })

  if (isError) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
        <FormWorkspace workspaceId={workspaceId} userId={userId} />
      </Flex>
    )
  }

  if (isLoading) {
    return <FullLoader title='Cargando información' description='Estamos preparando el entorno de trabajo.' />
  }

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <UserProvider userId={userId}>
        <WithAuthorization>
          {children}
        </WithAuthorization>
      </UserProvider>
    </WorkspaceProvider>
  )
}
