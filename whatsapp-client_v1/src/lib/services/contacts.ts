import { SuccessDataResponse } from "@/types/response"
import { api } from "../axios"

const ROUTE = '/contacts'

export type Contact = {
  pkId: string
  id: string
  name: string
  image?: string
  notify: string
  verifiedName?: string
}

export const getContact = async ({ workspaceId, sessionId, id }: { workspaceId: string, sessionId: string, id: string }) => {
  try {
    const { data: response } = await api
      .post<SuccessDataResponse<{ contacts: Contact[] }>>(
        `${workspaceId}/${sessionId}${ROUTE}`,
        { id },
        { timeout: 0 }
      )

    const { contacts } = response.data
    if (!contacts || contacts.length === 0) {
      return {} as Contact
    }

    return contacts[0]
  } catch (error) {
    throw new Error('Error on fetch contact')
  }
}

export const isValidContact = async ({ workspaceId, sessionId, id }: { workspaceId: string, sessionId: string, id: string }) => {
  try {
    const { data: response } = await api
      .post<SuccessDataResponse<{ isValid: boolean }>>(
        `${workspaceId}/${sessionId}${ROUTE}/valid`,
        { id },
        { timeout: 0 }
      )

    const { isValid } = response.data

    return isValid
  } catch (error) {
    throw new Error('Error on fetch contact')
  }
}
