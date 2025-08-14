import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"
import { Session } from "@/types"

const ROUTE = '/sessions'

export const addSession = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<{ qr: string }>>(`${ROUTE}/add`, {
      workspaceId,
      sessionId
    }, {
      timeout: 0
    })

    return response.data
  } catch (error) {
    throw new Error('Error adding a new session')
  }
}

export const getSessions = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { data: response } = await api.get<SuccessDataResponse<{ sessions: Session[] }>>(`${ROUTE}/${workspaceId}`)
    return response.data
  } catch (error) {
    throw new Error('Error on fetch sessions')
  }
}

export const deleteSession = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const response = await api.delete<SuccessDataResponse<{ sessions: Session[] }>>(`${ROUTE}`, {
      data: {
        workspaceId,
        sessionId
      }
    })

    return response.data
  } catch (error) {
    throw new Error('Error on delete sessions')
  }
}
