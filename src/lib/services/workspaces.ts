import { AxiosError } from 'axios'
import { api } from '../axios'

const ROUTE = '/workspaces'

export const addWorkspace = async ({ workspaceId, name }: { workspaceId: string, name: string }) => {
  try {
    const response = await api.post(`${ROUTE}/add`, {
      workspaceId,
      name
    })

    return response.data as { ok: boolean, message: string }
  } catch {
    throw new Error('Error adding a new workspace')
  }
}

export const getWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const response: { ok?: boolean, data: { data?: string, name?: string, error?: string } } = await api.get(`${ROUTE}/${workspaceId}`)

    return response.data as { id: string, name: string }
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 404) {
      return null
    }
    throw new Error('Error on fetch workspaces')
  }
}
