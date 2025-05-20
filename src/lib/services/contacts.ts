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
    const response = await api
      .post(
        `${workspaceId}/${sessionId}${ROUTE}`,
        { id },
        { timeout: 0 }
      )

    const { contacts } = response.data as { contacts: Contact[] }
    if (!contacts || contacts.length === 0) {
      return {} as Contact
    }

    return contacts[0]
  } catch (error) {
    throw new Error('Error on fetch contact')
  }
}
