import { useContext } from '@/hooks/useContext.ts'
import { FullLoader } from '@/components/loading/full-loading'
import { Error } from '../error'
import { ERROR_LOAD_CONTEXT } from '@/config/errors'
import { WorkspaceProvider } from '../providers/workspace/workspace-provider'
import { UserProvider } from '../providers/user/user-provider'

type MondayContextProps = {
  children: React.ReactNode
}

export default function MondayContext({ children }: MondayContextProps) {
  const { data: context, isLoading, isError } = useContext()

  if (isLoading) {
    return <FullLoader title='Obteniendo información de monday' description='Estamos preparando el entorno de trabajo.' />
  }

  if (!context || isError) {
    return <Error title={ERROR_LOAD_CONTEXT.title} errorMessage={ERROR_LOAD_CONTEXT.title} />
  }

  const { accountId: workspaceId, userId } = context

  return (
    <WorkspaceProvider workspaceId={workspaceId}>
      <UserProvider userId={userId}>
        {children}
      </UserProvider>
    </WorkspaceProvider>
  )
}
