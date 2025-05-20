import { api } from "../axios"
const ROUTE = '/profile'

export const getProfile = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const response = await api.get(`${ROUTE}/${workspaceId}/${sessionId}`)

    return response.data as { user: { name?: string, id: string, image: string } }
  } catch (error) {
    throw new Error('Error on fetch sessions')
  }
}
