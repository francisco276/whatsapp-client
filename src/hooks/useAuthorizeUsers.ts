import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { MondayApi } from '@/lib/monday/api'
import { getAuthorizationUsers } from '@/lib/services/authorization'
import { useWorkspaceId } from './useWorkspaceId'
import { User } from '@/types/monday'
import { AuthorizedUser } from '@/types'
import { AUTHORIZATION_TYPES } from '@/config/constants'

type UseAuthorizedUserProps = {
  authorized: { value: keyof typeof AUTHORIZATION_TYPES, label: string },
  search: string
}

export const useAuthorizeUsers = ({ authorized, search }: UseAuthorizedUserProps) => {
  const monday = new MondayApi()
  const workspaceId = useWorkspaceId()

  const { data: authorizedUsersResponse } = useQuery({
    queryKey: ['authorizeUsers'],
    queryFn: () => getAuthorizationUsers({ workspaceId })
  })

  const { data: userResponse, isLoading: isUserLoading } = useQuery({
    queryKey: ['users'],
    queryFn: () => monday.query.getUsers()
  })

  const authorizedUserIds = useMemo(() => authorizedUsersResponse?.authorizations.map(user => user.userId) ?? [], [authorizedUsersResponse])

  function passSearch(user: AuthorizedUser) {
    if (!search) return true
    const searchLower = search.toLowerCase()
    return user.name.toLowerCase().includes(searchLower)
  }

  const passesFilter = (user: AuthorizedUser) => {
    if (authorized.value === 'All') return true;
    if (authorized.value === 'Authorized') return user.authorized;
    if (authorized.value === 'Unauthorized') return !user.authorized;
    return false
  }

  const users: AuthorizedUser[] = useMemo(() => {
    const users = userResponse ? userResponse.data.users : []

    return users.map((user: User) => {
      return {
        id: user.id,
        name: user.name,
        image: user.photo_thumb,
        authorized: authorizedUserIds.includes(user.id),
        workspaceId: workspaceId
      }
    }).filter((user: AuthorizedUser) => passesFilter(user) && passSearch(user))
  }, [userResponse, authorizedUserIds, authorized, search])

  return {
    users,
    isLoading: isUserLoading
  }
}
