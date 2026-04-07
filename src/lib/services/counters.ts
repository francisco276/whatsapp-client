import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"

const ROUTE = '/counters'
const LOCAL_STORAGE_KEY = 'wa_message_counter'

export type CounterData = {
  sentCount: number
  messageLimit: number
  year: number
  month: number
}

const getLocalCounter = (workspaceId: string): CounterData => {
  try {
    const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${workspaceId}`)
    if (stored) {
      const data = JSON.parse(stored) as CounterData
      const now = new Date()
      if (data.year === now.getFullYear() && data.month === now.getMonth() + 1) {
        return data
      }
    }
  } catch {
  }
  return { sentCount: 0, messageLimit: 1000, year: new Date().getFullYear(), month: new Date().getMonth() + 1 }
}

const setLocalCounter = (workspaceId: string, data: CounterData): void => {
  try {
    localStorage.setItem(`${LOCAL_STORAGE_KEY}_${workspaceId}`, JSON.stringify(data))
  } catch {
  }
}

export const getCounter = async ({ workspaceId }: { workspaceId: string }): Promise<CounterData> => {
  try {
    const { data: response } = await api.get<SuccessDataResponse<CounterData>>(`${ROUTE}/${workspaceId}`)
    setLocalCounter(workspaceId, response.data)
    return response.data
  } catch {
    return getLocalCounter(workspaceId)
  }
}

export const incrementCounter = async ({ workspaceId }: { workspaceId: string }): Promise<CounterData | null> => {
  const localData = getLocalCounter(workspaceId)
  const newData: CounterData = {
    sentCount: localData.sentCount + 1,
    messageLimit: localData.messageLimit,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1
  }
  setLocalCounter(workspaceId, newData)

  try {
    const { data: response } = await api.post<SuccessDataResponse<CounterData>>(`${ROUTE}/${workspaceId}/increment`)
    setLocalCounter(workspaceId, response.data)
    return response.data
  } catch {
    return newData
  }
}

export const setMessageLimit = async ({ workspaceId, password, messageLimit }: { workspaceId: string, password: string, messageLimit: number }): Promise<{ success: boolean, message?: string }> => {
  try {
    const { data: response } = await api.post(`${ROUTE}/${workspaceId}/set-limit`, { password, messageLimit })
    if (response.success) {
      const currentLocal = getLocalCounter(workspaceId)
      setLocalCounter(workspaceId, { ...currentLocal, messageLimit })
    }
    return { success: response.success }
  } catch (error: any) {
    const message = error?.response?.data?.message || 'Error al configurar el límite'
    return { success: false, message }
  }
}
