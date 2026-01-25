import { MondayApi } from '@/lib/monday/api'
import { formatPhoneToWhatsAppJID, jidToFormatedPhone } from "@/utils/whatsapp"
import { isValidContact } from "@/lib/services/contacts"
import { getChats } from "@/lib/services/chats"
import { getPhoneColumnsByColumnId } from '@/utils/utils'
import { PublicError, ValidationError } from '@/errors/PublicError'
import { ERROR_PHONE_NUMBER_INVALID, ERROT_ITEM_NOT_FOUNT } from '@/config/errors'
import { ColumnValue } from '@/types/monday'

type ColumnValuesResponse = { items: { column_values: ColumnValue[] } }

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)\+]/g, '').replace(/^0+/, '')
}

function extractLast10Digits(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10 ? digits.slice(-10) : digits
}

function findPhoneColumnFromValues(columnValues: ColumnValue[]): { phone: string, country_short_name: string } | null {
  for (const column of columnValues) {
    if ('phone' in column && column.phone) {
      return { phone: column.phone, country_short_name: column.country_short_name || 'US' }
    }
    if ('display_value' in column && column.display_value) {
      const displayValue = column.display_value
      if (displayValue && /^\+?\d[\d\s-]+$/.test(displayValue.replace(/\s/g, ''))) {
        const formattedPhone = displayValue.startsWith('+') ? displayValue : `+${displayValue}`
        return { phone: formattedPhone.replace(/[\s-]/g, ''), country_short_name: 'US' }
      }
    }
  }
  return null
}

async function findChatByPhone(workspaceId: string, sessionId: string, phone: string): Promise<string | null> {
  try {
    const normalizedPhone = normalizePhone(phone)
    const phoneLast10 = extractLast10Digits(phone)
    console.log('[findChatByPhone] Searching for phone:', { normalizedPhone, phoneLast10 })
    
    const { chats } = await getChats({ workspaceId, sessionId })
    console.log('[findChatByPhone] Total chats to search:', chats.length)
    
    for (const chat of chats) {
      const chatPhone = jidToFormatedPhone(chat.id)
      
      if (chatPhone) {
        const normalizedChatPhone = normalizePhone(chatPhone)
        const chatLast10 = extractLast10Digits(chatPhone)
        
        if (normalizedChatPhone.includes(normalizedPhone) || normalizedPhone.includes(normalizedChatPhone)) {
          console.log('[findChatByPhone] Match by standard JID:', chat.id)
          return chat.id
        }
        
        if (phoneLast10.length >= 10 && chatLast10.length >= 10) {
          if (phoneLast10 === chatLast10) {
            console.log('[findChatByPhone] Match by last 10 digits:', chat.id)
            return chat.id
          }
        }
      }
      
      if (chat.name) {
        const normalizedName = normalizePhone(chat.name)
        const nameLast10 = extractLast10Digits(chat.name)
        
        if (normalizedName.includes(normalizedPhone) || normalizedPhone.includes(normalizedName)) {
          console.log('[findChatByPhone] Match by chat name (normalized):', chat.id, chat.name)
          return chat.id
        }
        
        if (phoneLast10.length >= 10 && nameLast10.length >= 10 && phoneLast10 === nameLast10) {
          console.log('[findChatByPhone] Match by chat name (last 10):', chat.id, chat.name)
          return chat.id
        }
      }
    }
    
    console.log('[findChatByPhone] No match found')
    return null
  } catch (error) {
    console.error('[findChatByPhone] Error:', error)
    return null
  }
}

export async function getSingleChatInformationAutoDetect({
  monday,
  workspaceId,
  sessionId,
  itemId
}: { monday: MondayApi, workspaceId: string, sessionId: string, itemId: string }) {
  try {
    console.log('[AutoDetect] Starting with itemId:', itemId)
    const { data } = await monday.query.getAllColumnValuesFromItem({ itemId })
    console.log('[AutoDetect] Got column values:', data)
    const item = data.items[0]

    if (!item || !item.column_values) {
      console.log('[AutoDetect] Item not found')
      throw new PublicError(ERROT_ITEM_NOT_FOUNT)
    }

    console.log('[AutoDetect] Column values:', item.column_values.map((c: ColumnValue) => ({ id: c.id, phone: (c as any).phone, display_value: (c as any).display_value })))
    
    const phoneData = findPhoneColumnFromValues(item.column_values)
    console.log('[AutoDetect] Phone data found:', phoneData)
    
    if (!phoneData || !phoneData.phone) {
      console.log('[AutoDetect] No valid phone column found')
      throw new ValidationError(ERROR_PHONE_NUMBER_INVALID.title, ERROR_PHONE_NUMBER_INVALID.description)
    }

    const jid = formatPhoneToWhatsAppJID(phoneData.phone, phoneData.country_short_name as any)
    console.log('[AutoDetect] Formatted JID:', jid)
    
    let isValid = await isValidContact({ workspaceId, sessionId, id: jid })
    console.log('[AutoDetect] Is valid contact (standard JID):', isValid)
    let chatId = jid

    if (!isValid) {
      console.log('[AutoDetect] Trying fallback search for phone:', phoneData.phone)
      const foundChatId = await findChatByPhone(workspaceId, sessionId, phoneData.phone)
      console.log('[AutoDetect] Found chat by phone search:', foundChatId)
      if (foundChatId) {
        chatId = foundChatId
        isValid = true
      }
    }

    console.log('[AutoDetect] Final result:', { isValid, chatId })
    return {
      isValid,
      chatId
    }
  } catch (error) {
    console.error('[AutoDetect] Error:', error)
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
