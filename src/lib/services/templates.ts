import type { CreateTemplate, TemplateItem, UpdateTemplate } from '@/types/templates'
import type { SuccessDataResponse } from "@/types/response"
import { api } from '../axios'
const ROUTE = '/templates'

export const find = async ({ id }: { id: string }) => {
  try {
    const { data } = await api.get<SuccessDataResponse<TemplateItem[]>>(`${ROUTE}/${id}`)
    const { data: items } = data

    return items[0]
  } catch {
    throw new Error('Error adding a templates')
  }
}

export const get = async ({ workspaceId }: { workspaceId: string }) => {
  try {
    const { data } = await api.post<SuccessDataResponse<{ templates: TemplateItem[] }>>(`${ROUTE}/`, {
      workspaceId
    })
    const { data: { templates } } = data

    return templates
  } catch {
    throw new Error('Error adding a templates')
  }
}


export const add = async (template: CreateTemplate) => {
  try {
    const { data } = await api.post<SuccessDataResponse<{ templates: TemplateItem[] }>>(`${ROUTE}/add`, template)
    const { data: { templates } } = data

    return templates[0]
  } catch {
    throw new Error('Error adding a templates')
  }
}

export const update = async (template: UpdateTemplate) => {
  try {
    const { data } = await api.put<SuccessDataResponse<TemplateItem[]>>(`${ROUTE}`, template)
    const { data: items } = data

    return items[0]
  } catch {
    throw new Error('Error to update a templates')
  }
}

export const remove = async ({ id }: { id: string }) => {
  try {
    const { data } = await api.delete<SuccessDataResponse<TemplateItem[]>>(`${ROUTE}/${id}`)
    const { data: items } = data

    return items[0]
  } catch {
    throw new Error('Error adding a templates')
  }
}
