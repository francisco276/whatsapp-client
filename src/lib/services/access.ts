import { SessionAccessUser } from "@/types"
import { api } from "../axios"
import { SuccessDataResponse } from "@/types/response"

const ROUTE = '/access'

export const updateAcccesUser = async ({
  workspaceId,
  sessionId,
  userId,
  deleted
}: {
  workspaceId: string,
  sessionId: string,
  userId: string,
  deleted?: boolean
}) => {
  try {
    const response = await api.put(`${ROUTE}`, {
      workspaceId,
      sessionId,
      userId,
      deleted,
    })

    return response.data
  } catch {
    throw new Error('Error adding a autorization user')
  }
}

export const getAccessUsers = async ({ workspaceId, sessionId }: { workspaceId: string, sessionId: string }) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<SessionAccessUser>>(`${ROUTE}/get`, {
      workspaceId,
      sessionId
    })
    return response.data
  } catch {
    throw new Error('Error adding a autorization user')
  }
}
