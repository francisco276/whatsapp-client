import { useQuery } from '@tanstack/react-query'
import { getIfAuthorizationUserExist } from '@/lib/services/authorization.ts'
import { Flex, Icon } from '@vibe/core'
import { Security } from '@vibe/icons'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { FullLoader } from './loading/full-loading'
import { UserProvider } from './providers/user/user-provider'
import { useUserId } from '@/hooks/useUserId'

type WithAuthorizationProps = {
  children: React.ReactNode
}

export const WithAuthorization = ({ children }: WithAuthorizationProps) => {
  const workspaceId = useWorkspaceId()
  const userId = useUserId()

  const { data: isValidUser, isLoading, isFetched } = useQuery({
    queryKey: ['authorized', workspaceId, userId],
    queryFn: () => getIfAuthorizationUserExist({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId
  })

  if (!isFetched || isLoading) {
    return <FullLoader
      title="Revisando tus permisos"
      description='Solo estamos asegurándonos de que todo esté en orden antes de continuar.'
    />
  }

  if (!isValidUser) {
    return (
      <Flex className='h-screen bg-slate-50'>
        <Flex className='flex-1' justify='center' align='center' direction='column'>
          <Icon iconSize={56} icon={Security} className='text-[#E83442]' />
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 text-slate-700 mt-4">Acceso denegado</h3>
            <p className="text-sm text-slate-500">No tienes permiso para acceder a esta aplicación. Por favor, contacta a tu administrador.</p>
          </div>
        </Flex>
      </Flex>
    )
  }

  return <UserProvider userId={userId}>{children}</UserProvider>
}
