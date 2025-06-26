import { useQuery } from '@tanstack/react-query'
import { MondayApi } from '@/lib/monday/api'
import { getAuthorizationUsers } from '@/lib/services/authorization'
import { useWorkspaceId } from './useWorkspaceId'
import { useContext } from './useContext'

export const useNotifications = () => {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { itemId, boardId, userId } = context
  const workspaceId = useWorkspaceId()

  const { data: authorizedUsersResponse } = useQuery({
    queryKey: ['authorizeUsers'],
    queryFn: () => getAuthorizationUsers({ workspaceId })
  })

  async function sendNotifications() {
    const notifications = authorizedUsersResponse?.authorizations
      .filter(user =>  user.userId !== userId)
      .map(async (user) => await monday.mutation.createNotification(user.userId, itemId || boardId, "Un mensaje nuevo se ha enviado"))

    if (Array.isArray(notifications) && notifications.length > 0) {
      await Promise.all(notifications)
    }
  }

  return {
    sendNotifications
  }
}
