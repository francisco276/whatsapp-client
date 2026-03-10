import type { FastifyRequest, FastifyReply } from 'fastify'
import { WAMessage } from 'baileys'
import { downloadMediaMessage, downloadContentFromMessage } from 'baileys'
import { and, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { registerMondayCredentials, registerMondayUserTarget, getMondayCredentials } from '@/services/monday-notifications'
import { AuthorizationError, MessageError } from '@/errors/errors'
import { getAuthorizationUser } from '@/services/authorizations'

const MONDAY_FILE_UPLOAD_URL = 'https://api.monday.com/v2/file'

interface RegisterBody {
  workspaceId: string
  userId: string
  boardId: string
  mondayToken?: string
}

export const register = async (request: FastifyRequest<{ Body: RegisterBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, userId, boardId, mondayToken } = request.body
    const { userId: authenticatedUserId } = request.user

    if (authenticatedUserId !== userId) {
      throw new AuthorizationError('User ID mismatch')
    }

    if (mondayToken !== undefined && mondayToken !== '') {
      const user = await getAuthorizationUser({ workspaceId, userId })
      if (user.role !== 'admin') {
        throw new AuthorizationError('Only admins can set the Monday API token')
      }
      await registerMondayCredentials(workspaceId, mondayToken)
    }

    await registerMondayUserTarget(workspaceId, userId, boardId)

    await sendSuccessResponse(reply, { registered: true })
  } catch (error) {
    await handleError(error, reply, 'Failed to register Monday notification target')
  }
}

function getMediaFileName (message: WAMessage): string {
  const msg = message.message
  if (!msg) return 'file'

  if (msg.imageMessage) {
    const ext = (msg.imageMessage.mimetype || 'image/jpeg').split('/')[1] || 'jpg'
    return `image_${message.messageTimestamp}.${ext}`
  }
  if (msg.videoMessage) {
    const ext = (msg.videoMessage.mimetype || 'video/mp4').split('/')[1] || 'mp4'
    return `video_${message.messageTimestamp}.${ext}`
  }
  if (msg.audioMessage) {
    const ext = (msg.audioMessage.mimetype || 'audio/ogg').split('/')[1]?.replace('codecs', 'ogg') || 'ogg'
    return `audio_${message.messageTimestamp}.${ext.split(';')[0]}`
  }
  if (msg.documentMessage) {
    return msg.documentMessage.fileName || `document_${message.messageTimestamp}`
  }
  if (msg.documentWithCaptionMessage?.message?.documentMessage) {
    return msg.documentWithCaptionMessage.message.documentMessage.fileName || `document_${message.messageTimestamp}`
  }
  if (msg.stickerMessage) {
    return `sticker_${message.messageTimestamp}.webp`
  }

  return `file_${message.messageTimestamp}`
}

async function downloadWhatsAppMedia (message: WAMessage): Promise<Buffer> {
  const buffer = await downloadMediaMessage(message, 'buffer', {}).catch(() => undefined)

  if (buffer !== undefined) {
    return buffer as Buffer
  }

  const msg = message.message
  if (msg?.stickerMessage?.directPath) {
    const stream = await downloadContentFromMessage(
      {
        mediaKey: msg.stickerMessage.mediaKey,
        directPath: msg.stickerMessage.directPath,
        url: `https://mmg.whatsapp.net${msg.stickerMessage.directPath}`
      },
      'sticker',
      {}
    )
    const chunks: Buffer[] = []
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer)
    }
    return Buffer.concat(chunks)
  }

  throw new MessageError('Could not download media from WhatsApp')
}

function sanitizeId (value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '')
}

async function uploadFileToMonday (accessToken: string, itemId: string, columnId: string, fileName: string, fileBuffer: Buffer): Promise<any> {
  const safeItemId = sanitizeId(itemId)
  const safeColumnId = sanitizeId(columnId)

  const query = `mutation ($file: File!) { add_file_to_column (file: $file, item_id: ${safeItemId}, column_id: "${safeColumnId}") { id } }`

  const blob = new Blob([fileBuffer])
  const file = new File([blob], fileName)
  const formData = new FormData()
  formData.append('query', query)
  formData.append('variables[file]', file, fileName)

  const response = await fetch(MONDAY_FILE_UPLOAD_URL, {
    method: 'POST',
    headers: {
      Authorization: accessToken
    },
    body: formData
  })

  const result = await response.json() as { data?: any, errors?: Array<{ message: string }> }

  if (result.errors && result.errors.length > 0) {
    console.error('[MondayFileUpload] API errors:', result.errors)
    throw new Error(result.errors[0].message)
  }

  return result.data
}

interface UploadFileBody {
  workspaceId: string
  sessionId: string
  itemId: string
  columnId: string
  messageIds: number[]
}

export const uploadFiles = async (request: FastifyRequest<{ Body: UploadFileBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { workspaceId, sessionId, itemId, columnId, messageIds } = request.body
    const { accountId } = request.user

    if (accountId !== workspaceId) {
      throw new AuthorizationError('Workspace mismatch')
    }

    await getAuthorizationUser({ workspaceId, userId: request.user.userId })

    if (!messageIds || messageIds.length === 0) {
      throw new MessageError('No message IDs provided')
    }

    const credentials = await getMondayCredentials(workspaceId)
    if (!credentials) {
      throw new AuthorizationError('Monday API token not configured for this workspace. An admin must set it in Settings.')
    }

    const dbMessages = await db
      .select()
      .from(messagesTable)
      .where(
        and(
          eq(messagesTable.workspaceId, workspaceId),
          eq(messagesTable.sessionId, sessionId),
          inArray(messagesTable.pkId, messageIds)
        )
      )

    if (dbMessages.length === 0) {
      throw new MessageError('No matching messages found')
    }

    const results: Array<{ success: boolean, fileName: string, error?: string }> = []

    for (const dbMsg of dbMessages) {
      const waMessage = { key: dbMsg.key, message: dbMsg.message, messageTimestamp: dbMsg.messageTimestamp } as WAMessage
      const fileName = getMediaFileName(waMessage)
      try {
        const buffer = await downloadWhatsAppMedia(waMessage)
        await uploadFileToMonday(credentials.accessToken, itemId, columnId, fileName, buffer)
        results.push({ success: true, fileName })
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error'
        console.error(`[MondayFileUpload] Failed to upload ${fileName}:`, errorMsg)
        results.push({ success: false, fileName, error: errorMsg })
      }
    }

    const succeeded = results.filter(r => r.success).length
    const failed = results.filter(r => !r.success).length

    await sendSuccessResponse(reply, { uploaded: succeeded, failed, results })
  } catch (error) {
    await handleError(error, reply, 'Failed to upload files to Monday.com')
  }
}
