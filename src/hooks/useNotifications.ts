import { useQuery } from '@tanstack/react-query'
import { MondayApi } from '@/lib/monday/api'
import { getAuthorizationUsers } from '@/lib/services/authorization'
import { useWorkspaceId } from './useWorkspaceId'
import { useContext } from './useContext'

export const useNotifications = () => {
  const monday = new MondayApi()
  const { data: context } = useContext()
  const { itemId, boardId, userId } = context || {}
  const workspaceId = useWorkspaceId()

  const { data: authorizedUsersResponse } = useQuery({
    queryKey: ['authorizeUsers'],
    queryFn: () => getAuthorizationUsers({ workspaceId })
  })

  async function sendNotifications(contactName?: string) {
    if (!itemId && !boardId) return

    const message = contactName
      ? `Nuevo mensaje de WhatsApp de: ${contactName}`
      : 'Un mensaje nuevo se ha enviado'

    const notifications = authorizedUsersResponse?.authorizations
      .filter(user =>  user.userId !== userId)
      .map(async (user) => await monday.mutation.createNotification(user.userId, (itemId || boardId)!, message))

    if (Array.isArray(notifications) && notifications.length > 0) {
      await Promise.all(notifications)
    }
  }

  return {
    sendNotifications
  }
}
