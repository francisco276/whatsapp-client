import { useQuery } from '@tanstack/react-query'
import { useContext } from '@/hooks/useContext.ts'
import { getToken } from '@/lib/services/auth'
import { FullLoader } from '@/components/loading/full-loading.tsx'
import { Error } from '../error'

type AuthorizationProps = {
  children: React.ReactNode
}

export default function Authorization({ children }: AuthorizationProps) {
  const { data: context } = useContext()
  const { userId, accountId: workspaceId } = context!

  const { isLoading, isError } = useQuery({
    queryKey: ['getToken', workspaceId, userId],
    queryFn: () => getToken({ workspaceId, userId }),
    enabled: !!workspaceId && !!userId,
    retry: 1,
  })
  
  if (isLoading) {
    return <FullLoader title='Cargando información' description='Estamos preparando el entorno de trabajo.' />
  }

  if (isError) {
    return <Error />
  }

  return children
}