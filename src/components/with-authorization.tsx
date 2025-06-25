import { useQuery } from '@tanstack/react-query'
import { getIfAuthorizationUserExist } from '@/lib/services/authorization.ts'
import { Flex } from '@vibe/core'
import { Error } from './error'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'

type WithAuthorizationProps = {
  userId: string
  children: React.ReactNode
}

export const WithAuthorization = ({ userId, children }: WithAuthorizationProps) => {
  const workspaceId = useWorkspaceId()
  const { data: isValidUser, isLoading, isFetched } = useQuery({
    queryKey: ['authorized', workspaceId, userId],
    queryFn: () => getIfAuthorizationUserExist({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId
  })

  if (!isFetched || isLoading) {
    return <p>Loading....</p>
  }

  if (!isValidUser) {
    return (
      <Flex className='w-screen h-screen' justify='center' align='center' >
        <Error errorMessage="Tu cuenta no tiene los permisos necesarios para ver esta información." title='No tienes acceso a esta sección.' />
      </Flex>
    )
  }

  return children
}
