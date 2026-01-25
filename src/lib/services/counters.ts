import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"

const ROUTE = '/counters'

export type CounterData = {
  sentCount: number
  year: number
  month: number
}

export const getCounter = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { data: response } = await api.get<SuccessDataResponse<CounterData>>(`${ROUTE}/${workspaceId}`)
    return response.data
  } catch (error) {
    console.error('[getCounter] Error:', error)
    return { sentCount: 0, year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
  }
}

export const incrementCounter = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { data: response } = await api.post<SuccessDataResponse<CounterData>>(`${ROUTE}/${workspaceId}/increment`)
    return response.data
  } catch (error) {
    console.error('[incrementCounter] Error:', error)
    return null
  }
}
