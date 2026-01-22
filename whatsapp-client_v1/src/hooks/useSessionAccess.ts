import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MondayApi } from '@/lib/monday/api'
import { useWorkspaceId } from './useWorkspaceId'
import { User } from '@/types/monday'
import { AuthorizedUser } from '@/types'
import { AUTHORIZATION_TYPES } from '@/config/constants'
import { getAccessUsers, updateAcccesUser } from '@/lib/services/access'
import { useSessionId } from './useSessionId'

type UseAuthorizedUserProps = {
  authorized: { value: keyof typeof AUTHORIZATION_TYPES, label: string },
  search: string
}

type AccessUser = Omit<AuthorizedUser, 'role'>

export const useSessionAccess = ({ authorized, search }: UseAuthorizedUserProps) => {
  const queryClient = useQueryClient()
  const monday = new MondayApi()
  const workspaceId = useWorkspaceId()
  const sessionId = useSessionId()

  const { data: usersWithSessionAccess, isLoading: isAccesUserLoading } = useQuery({
    queryKey: ['accessUsers'],
    queryFn: () => getAccessUsers({ workspaceId, sessionId }),
    enabled: !!workspaceId && !!sessionId
  })

  const { data: userResponse, isLoading: isUserLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => monday.query.getUsers(),
    enabled: !!workspaceId && !!sessionId
  })

  const mutate = useMutation({
    mutationFn: (params: { userId: string, deleted?: boolean }) => updateAcccesUser({ workspaceId, sessionId, ...params }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accessUsers'] })
    }
  })

  const accessUserId = useMemo(() => usersWithSessionAccess?.users?.map(user => user.userId) ?? [], [usersWithSessionAccess])

  function passSearch(user: AccessUser) {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return user.name.toLowerCase().includes(searchLower)
  }

  const passesFilter = (user: AccessUser) => {
    if (authorized.value === 'All') return true;
    if (authorized.value === 'Authorized') return user.authorized;
    if (authorized.value === 'Unauthorized') return !user.authorized;
    return false
  }

  const users: AccessUser[] = useMemo(() => {
    const users = userResponse ? userResponse.data.users : []

    return users.map((user: User) => {
      return {
        id: user.id,
        name: user.name,
        image: user.photo_thumb,
        authorized: accessUserId.includes(user.id),
      }
    }).filter((user: AccessUser) => passesFilter(user) && passSearch(user))
  }, [userResponse, accessUserId, authorized, search])


  return {
    users,
    isLoading: isUserLoading || isAccesUserLoading,
    mutate
  }
}
