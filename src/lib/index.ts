import { MondayApi } from '@/lib/monday/api'
import { formatPhoneToWhatsAppJID } from "@/utils/whatsapp"
import { isValidContact } from "@/lib/services/contacts"
import { getPhoneColumnsByColumnId } from '@/utils/utils'
import { PublicError, ValidationError } from '@/errors/PublicError'
import { ERROR_PHONE_NUMBER_INVALID, ERROT_ITEM_NOT_FOUNT } from '@/config/errors'
import { ColumnValue } from '@/types/monday'

type ColumnValuesResponse = { items: { column_values: ColumnValue[] } }

function findPhoneColumnFromValues(columnValues: ColumnValue[]): { phone: string, country_short_name: string } | null {
  for (const column of columnValues) {
    if (column.__typename === 'PhoneValue' && column.phone) {
      return { phone: column.phone, country_short_name: column.country_short_name || 'US' }
    }
    if (column.__typename === 'MirrorValue' && column.display_value) {
      const displayValue = column.display_value
      if (displayValue && /^\+?\d[\d\s-]+$/.test(displayValue.replace(/\s/g, ''))) {
        const formattedPhone = displayValue.startsWith('+') ? displayValue : `+${displayValue}`
        return { phone: formattedPhone.replace(/[\s-]/g, ''), country_short_name: 'US' }
      }
    }
  }
  return null
}

export async function getSingleChatInformationAutoDetect({
  monday,
  workspaceId,
  sessionId,
  itemId
}: { monday: MondayApi, workspaceId: string, sessionId: string, itemId: string }) {
  try {
    const { data } = await monday.query.getAllColumnValuesFromItem({ itemId })
    const item = data.items[0]

    if (!item || !item.column_values) throw new PublicError(ERROT_ITEM_NOT_FOUNT)

    const phoneData = findPhoneColumnFromValues(item.column_values)
    if (!phoneData || !phoneData.phone) {
      throw new ValidationError(ERROR_PHONE_NUMBER_INVALID.title, ERROR_PHONE_NUMBER_INVALID.description)
    }

    const id = formatPhoneToWhatsAppJID(phoneData.phone, phoneData.country_short_name as any)

    const isValid = await isValidContact({ workspaceId, sessionId, id })

    return {
      isValid,
      chatId: id
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
  }
}

export async function getSingleChatInformation({
  monday,
  workspaceId,
  sessionId,
  phoneColumnId,
  itemId
}: { monday: MondayApi, workspaceId: string, sessionId: string, phoneColumnId: string, itemId: string }) {
  try {
    const { data } = await monday.query.getPhoneColumnsByIdsForItem<ColumnValuesResponse>({ itemId, columnId: phoneColumnId })
    const item = data.items[0]

    const columnValues = item['column_values']
    if (!item || !columnValues) throw new PublicError(ERROT_ITEM_NOT_FOUNT)

    const phoneColumn = getPhoneColumnsByColumnId({ columnValues, columnId: phoneColumnId })
    if (phoneColumn === null || phoneColumn === undefined) throw new ValidationError(ERROR_PHONE_NUMBER_INVALID.title, ERROR_PHONE_NUMBER_INVALID.description)
    if (!phoneColumn.phone) throw new ValidationError(ERROR_PHONE_NUMBER_INVALID.title, ERROR_PHONE_NUMBER_INVALID.description)

    const id = formatPhoneToWhatsAppJID(phoneColumn.phone!, phoneColumn.country_short_name!)

    const isValid = await isValidContact({ workspaceId, sessionId, id })

    return {
      isValid,
      chatId: id
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
  }
}
