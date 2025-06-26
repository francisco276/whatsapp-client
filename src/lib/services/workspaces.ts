import { api } from '../axios'

const ROUTE = '/workspaces'

export const addWorkspace = async ({ workspaceId, name, userId }: { workspaceId: string, name: string, userId: string }) => {
  try {
    const response = await api.post(`${ROUTE}/add`, {
      workspaceId,
      name,
      userId
    })

    return response.data as { ok: boolean, message: string }
  } catch (error) {
    throw new Error('Error adding a new workspace')
  }
}

export const getWorkspace = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    // if (workspaceId === undefined) {
    //   throw new Error('Workspace ID is required')
    // }
    const response: { ok?: boolean, data: { data?: string, name?: string, error?: string } } = await api.get(`${ROUTE}/${workspaceId}`)
    if (response.data.error) {
      throw new Error('Error on fetch workspaces')
    }

    return response.data as { id: string, name: string }
  } catch (error) {
    throw new Error('Error on fetch workspaces')
  }
}
