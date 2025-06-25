import { api } from "../axios"

const ROUTE = '/sessions'

export const addSession = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const response = await api.post(`${ROUTE}/add`, {
      workspaceId,
      sessionId
    }, {
      timeout: 0
    })

    return response.data as { ok: boolean, message: string, qr: string }
  } catch (error) {
    throw new Error('Error adding a new session')
  }
}

export const getSessions = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const response = await api.get(`${ROUTE}/${workspaceId}`)

    return response.data as { sessions: { id: string }[] }
  } catch (error) {
    throw new Error('Error on fetch sessions')
  }
}

export const deleteSession = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const response = await api.delete(`${ROUTE}`, {
      data: {
        workspaceId,
        sessionId
      }
    })

    return response.data as { sessions: { id: string }[] }
  } catch (error) {
    throw new Error('Error on delete sessions')
  }
}
