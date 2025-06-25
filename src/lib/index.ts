import { MondayApi } from '@/lib/monday/api'
import { formatPhoneToWhatsAppJID } from "@/utils/whatsapp"
import { isValidContact } from "@/lib/services/contacts"
import { getColumnById } from '@/utils/utils'
import { PublicError } from '@/errors/PublicError'
import { ERROR_PHONE_NUMBER_INVALID, ERROT_ITEM_NOT_FOUNT } from '@/config/errors'
import { ColumnValue } from '@/types/monday'

type ColumnValuesResponse = { items: { column_values: ColumnValue[] } }

export async function getSingleChatInformation({
  monday,
  workspaceId,
  sessionId,
  phoneColumnId,
  itemId
}: { monday: MondayApi, workspaceId: string, sessionId: string, phoneColumnId: string, itemId: string }) {
  try {
    const { data } = await monday.query.getPhoneColumnsByIdsForItem<ColumnValuesResponse>(itemId)
    const item = data.items[0]

    const columnValues = item['column_values']
    if (!item || !columnValues) throw new PublicError(ERROT_ITEM_NOT_FOUNT)

    const phoneColumn = getColumnById({ columnValues, columnId: phoneColumnId })

    if (!phoneColumn) throw new PublicError(ERROR_PHONE_NUMBER_INVALID)

    const id = formatPhoneToWhatsAppJID(phoneColumn.phone!, phoneColumn.country_short_name!)

    const isValid = await isValidContact({ workspaceId, sessionId, id })

    return {
      isValid,
      chatId: id
    }
  } catch (error) {
    console.log({ error })
  }
}
