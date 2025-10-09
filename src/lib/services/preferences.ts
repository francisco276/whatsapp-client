import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"
import type { UserPreferencesConfig } from '@/types'

const ROUTE = '/preferences/'


type GetConfigurationParasm = { workspaceId: string, userId: string }
type UpdateConfigurationParams = { config: UserPreferencesConfig } & GetConfigurationParasm

export const updateConfigurationByUser = async ({ workspaceId, userId, config }: UpdateConfigurationParams) => {
  try {
    const response = await api.post(`${ROUTE}update`, {
      workspaceId,
      userId,
      config
    })

    return response.data
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}

export const getConfigurationByUser = async ({ workspaceId, userId }: GetConfigurationParasm) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<UserPreferencesConfig>>(`${ROUTE}`, {
      workspaceId,
      userId
    })

    return response.data
  } catch (error) {
    throw new Error('Error adding a autorization user')
  }
}
