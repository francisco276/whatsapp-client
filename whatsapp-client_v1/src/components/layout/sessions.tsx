import { SessionSidebar } from '@/components/sessions-sidebar'
import { Error } from '@/components/error'
import { ERROR_LOAD_SESSIONS } from '@/config/errors'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useSessions } from '@/hooks/useSession'
import PrincipalWrapper from './principal-wrapper'
import { SessionProvider } from '@/components/providers/session/session-provider'

type SessionsProps = {
  children?: React.ReactNode
  type?: 'small' | 'full'
}

export default function Sessions({ children, type }: SessionsProps) {
  const workspaceId = useWorkspaceId()
  const { data, isError, isLoading } = useSessions({ workspaceId })

  if (isError) {
    return (
      <PrincipalWrapper>
        <Error title={ERROR_LOAD_SESSIONS.title} errorMessage={ERROR_LOAD_SESSIONS.description} />
      </PrincipalWrapper>
    )
  }

  if (isLoading) {
    return (
      <PrincipalWrapper>
        <FullLoader title='Cargando sesiones' description='Estamos obteniendo las sesiones disponibles.' />
      </PrincipalWrapper>
    )
  }

  return (
    <PrincipalWrapper>
      <SessionProvider>
        <>
          <SessionSidebar
            sessions={data?.sessions ?? []}
            loading={isLoading}
            error={isError}
            type={type}
          />
          {children}
        </>
      </SessionProvider>
    </PrincipalWrapper>
  )
}
