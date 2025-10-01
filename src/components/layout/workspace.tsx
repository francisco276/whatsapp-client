import { FormWorkspace } from '@/components/form-workspace.tsx'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { UserProvider } from '@/components/providers/user/user-provider.tsx'
import { WorkspaceProvider } from '@/components/providers/workspace/workspace-provider.tsx'
import { WithAuthorization } from '@/components/with-authorization.tsx'
import { useContext } from '@/hooks/useContext.ts'
import { MondayApi } from '@/lib/monday/api'
import { getToken } from '@/lib/services/auth'
import { getWorkspace } from '@/lib/services/workspaces.ts'
import { useQuery } from '@tanstack/react-query'
import { Flex } from '@vibe/core'
import { Error } from '../error'
import { ERROR_LOAD_SESSION } from '@/config/errors'

type WorkspaceProps = {
  children: React.ReactNode
}

export default function Workspace({ children }: WorkspaceProps) {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { userId, accountId: workspaceId } = context

  const { isLoading: isLoadingToken, isError: isErrorToken } = useQuery({
    queryKey: ['getToken', workspaceId, userId],
    queryFn: () => getToken({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId && !!localStorage.getItem('auth_token')
  })

  const {
    isError,
    isLoading
  } = useQuery({
    queryKey: ['getWorkspace', workspaceId],
    queryFn: () => getWorkspace({ workspaceId }),
    enabled: !!workspaceId && !!localStorage.getItem('auth_token'),
  })

  if (isErrorToken) {
    return (
      <Error title={ERROR_LOAD_SESSION.title} errorMessage={ERROR_LOAD_SESSION.description}/>
    )
  }

  if (isError) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
        <FormWorkspace workspaceId={workspaceId} />
      </Flex>
    )
  }

  if (isLoading || isLoadingToken) {
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
