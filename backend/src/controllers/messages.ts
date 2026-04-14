import { jidNormalizedUser, WAMessage, type proto, type WAGenericMediaMessage } from 'baileys'
import { downloadMediaMessage, downloadContentFromMessage, isPnUser } from 'baileys'
import type { RouteHandler } from 'fastify'
import { and, eq, desc, lt, sql, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { messagesTable } from '@/db/schema'
import { serializeDrizzle } from '@/utils/drizzle'
import { delay as delayMs } from '@/utils'
import { handleFileUpload } from '@/utils/files'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'
import { validateSessionParam } from '@/validations/params'
import { AuthorizationError, MessageError } from '@/errors/errors'
import { getRoleInformation } from '@/utils/authorization'
import { getAuthorizationUser } from '@/services/authorizations'

export const list: RouteHandler = async (req, res): Promise<any> => {
  try {
    const { sessionId, workspaceId } = validateSessionParam(req)
    const { cursor = undefined, limit = 25 } = req.query as { cursor: boolean | undefined, limit: number }

    const filters = [
      eq(messagesTable.sessionId, sessionId),
      eq(messagesTable.workspaceId, workspaceId)
    ]
    if (cursor !== undefined) {
      filters.push(lt(messagesTable.pkId, Number(cursor)))
    }

    const query = db.select()
      .from(messagesTable)
      .where(
        and(...filters)
      )
      .limit(Number(limit))

    const messagesData = await query
    const serializedMessages = messagesData.map(m => serializeDrizzle(m))

    await sendSuccessResponse(res, {
      data: serializedMessages,
      cursor:
        serializedMessages.length !== 0 && serializedMessages.length === Number(limit)
          ? serializedMessages[0].pkId
          : null
    })
  } catch (e) {
    await handleError(e, res, 'An error occurred during message list')
  }
}

export const listByJid: RouteHandler = async (req, res): Promise<any> => {
  try {
    const { sessionId, workspaceId, jid } = req.params as { sessionId: string, workspaceId: string, jid: string }
    const { limit = 25, offset = 0 } = req.query as { limit: number, cursor?: string, offset: number }
    const { session } = req

    const filters = [
      eq(messagesTable.sessionId, sessionId),
      eq(messagesTable.workspaceId, workspaceId),
      sql`NOT (${messagesTable.message} ? 'protocolMessage' OR ${messagesTable.message} ? 'reactionMessage')`
    ]

    const store = session.session?.signalRepository.lidMapping

    const isOldId = isPnUser(jid)
    if (isOldId === true) {
      const newJid = await store?.getLIDForPN(jid)
      if (typeof newJid === 'string') {
        filters.push(inArray(messagesTable.remoteJid, [jid, newJid]))
      } else {
        filters.push(eq(messagesTable.remoteJid, jid))
      }
    } else {
      const newJid = await store?.getPNForLID(jid)
      if (typeof newJid === 'string') {
        filters.push(inArray(messagesTable.remoteJid, [jid, jidNormalizedUser(newJid)]))
      } else {
        filters.push(eq(messagesTable.remoteJid, jid))
      }
    }

    const query = db.select()
      .from(messagesTable)
      .where(
        and(...filters)
      )
      .orderBy(desc(messagesTable.messageTimestamp))
      .limit(Number(limit))
      .offset(Number(offset))

    const [messagesData] = await Promise.all([query])
    const serializedMessages = messagesData.map(m => serializeDrizzle(m))
    const cursor = serializedMessages.length !== 0 && serializedMessages.length === Number(limit)
      ? serializedMessages[serializedMessages.length - 1].pkId
      : null

    await sendSuccessResponse(res, {
      data: serializedMessages,
      cursor,
      offset: serializedMessages.length !== 0 ? Number(offset) + Number(limit) : null
    })
  } catch (e) {
    await handleError(e, res, 'An error occurred during message list')
  }
}

// export const send: RouteHandler = async (req, res) => {
//   try {
//     const { jid, type = 'number', message, options } = req.body as { jid: string, type: 'number' | 'group' | undefined, message: any, options: any }
//     const { session } = req
//
//     await session.ensureConnected()
//
//     const validJid = await session.validJid(jid, type)
//
//     if (validJid === null) return await res.send({ error: 'JID does not exist' }).status(400)
//     const binaryFields = ['document', 'image', 'video']
//     for (const field of binaryFields) {
//       if (field in message) {
//         message[field] = restoreBinaryField(message[field])
//       }
//     }
//
//     const result = await session.session?.sendMessage(validJid, message, options).then(data => console.log({ data }))
//     return await res.send(result).status(200)
//   } catch (e) {
//     console.log(e)
//     const message = 'An error occurred during message send'
//     return await res.send({ error: message }).status(500)
//   }
// }

export const send: RouteHandler = async (req, res) => {
  try {
    const { user: { userId } } = req
    const { fields, files } = await handleFileUpload(req.parts())
    const { jid, message = '' } = fields
    const { session, workspace } = req

    const user = await getAuthorizationUser({ workspaceId: workspace.id, userId })
    const roleInformation = getRoleInformation(user)

    if (!roleInformation.sendMessage) {
      throw new AuthorizationError('User is not authorized to send a message')
    }

    await session.ensureConnected(userId)

    const validJid = await session.validJid(jid)
    if (validJid === null) {
      throw new MessageError('Message JID does not exist or is not valid')
    }

    if (files.length === 0) {
      const result = await session.session?.sendMessage(validJid, { text: message })
      await sendSuccessResponse(res, { success: true, results: [result] })
    }

    const results = await Promise.all(
      files.map(async (file) => {
        const base = {
          caption: '',
          mimetype: file.mimetype,
          fileName: file.filename
        }

        if (file.mimetype.startsWith('image/')) {
          return await session.session?.sendMessage(validJid, {
            image: file.buffer,
            ...base
          })
        }

        if (file.mimetype.startsWith('video/')) {
          return await session.session?.sendMessage(validJid, {
            video: file.buffer,
            ...base
          })
        }

        return await session.session?.sendMessage(validJid, {
          document: file.buffer,
          ...base
        })
      })
    )

    return await sendSuccessResponse(res, { success: true, results })
  } catch (err) {
    await handleError(err, res, 'An error occurred during send a message')
  }
}

interface BulkResults { index: number, result: WAMessage | undefined }
interface BulkErrors { index: number, error: string }
interface MessageBulk { jid: string, type: 'number' | 'group' | undefined, message: any, options: any, delay: number }

function processMessageMedia (message: any): any {
  const mediaTypes = ['image', 'video', 'document', 'audio']
  for (const type of mediaTypes) {
    if (typeof message[type]?.url === 'string' && message[type].url.startsWith('data:')) {
      const parts = (message[type].url as string).split(',')
      const base64Data = parts[1]
      if (!base64Data) continue
      const buffer = Buffer.from(base64Data, 'base64')
      return { ...message, [type]: buffer }
    }
  }
  return message
}

export const sendBulk: RouteHandler = async (req, res) => {
  const { session } = req
  const results: BulkResults[] = []
  const errors: BulkErrors[] = []

  const messages = req.body as MessageBulk[]

  try {
    await session.ensureConnected()
  } catch {
    // session may still be usable, continue
  }

  for (const [index, { jid, type = 'number', delay = 1000, message, options }] of messages.entries()) {
    try {
      const validJid = await session.validJid(jid, type)
      if (!validJid) {
        errors.push({ index, error: 'Número no encontrado en WhatsApp' })
        continue
      }

      if (index > 0) await delayMs(delay)

      const processedMessage = processMessageMedia(message)
      const result = await session.session?.sendMessage(validJid, processedMessage, options)
      results.push({ index, result })
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'An error occurred during message send'
      errors.push({ index, error: errMsg })
    }
  }

  return await res.send({
    results,
    errors
  }).status(messages.length !== 0 && errors.length === messages.length ? 500 : 200)
}

// TODO: Added validation for message objects in the delete message and delete message only me functions.
export const deleteMessage: RouteHandler = async (req, res) => {
  try {
    const { session } = req
    /**
     * @type {string} jid
     * @type {string} type
     * @type {object} message
     *
     * @example {
     *  'jid': '120363xxx8@g.us',
     *  'type': 'group',
     *  'message': {
     *    'remoteJid': '120363xxx8@g.us',
     *    'fromMe': false,
     *    'id': '3EB0829036xxxxx'
     *  }
     * }
     * @returns {object} result
     */
    const { jid, type = 'number', message } = req.body as { jid: string, type: 'number' | 'group' | undefined, message: any }

    const exists = await session.jidExists(jid, type)
    if (!exists) {
      throw new MessageError('Message JID does not exist or is not valid')
    }

    const result = await session.session?.sendMessage(jid, { delete: message })

    await sendSuccessResponse(res, result)
  } catch (e) {
    await handleError(e, res, 'An error occurred during message delete')
  }
}

export const deleteMessageForMe: RouteHandler = async (req, res) => {
  try {
    const { session } = req
    /**
     * @type {string} jid
     * @type {string} type
     * @type {object} message
     *
     * @example {
     *  'jid': '120363xxx8@g.us',
     *  'type': 'group',
     *  'message': {
     *    'id': 'ATWYHDNNWU81732J',
     *    'fromMe': false,
     *    'timestamp': '1654823909'
     *  }
     * }
     * @returns {object} result
     */
    const { jid, type = 'number', message } = req.body as { jid: string, type: 'number' | 'group' | undefined, message: any }

    const exists = await session.jidExists(jid, type)
    if (!exists) {
      throw new MessageError('Message JID does not exist or is not valid')
    }

    const result = await session.session?.chatModify({ deleteForMe: { deleteMedia: true, key: message.key, timestamp: message.timestamp } }, jid)

    await sendSuccessResponse(res, result)
  } catch (e) {
    await handleError(e, res, 'An error occurred during message delete')
  }
}

export const download: RouteHandler = async (req, res) => {
  try {
    const message = req.body as WAMessage
    if (message === undefined || message.message === undefined || message.message === null) {
      throw new MessageError('Message not found or invalid format')
    }

    const type = Object.keys(message.message)[0] as keyof proto.IMessage
    const content = message.message[type] as WAGenericMediaMessage
    const buffer = await downloadMediaMessage(
      message,
      'buffer',
      {}
    ).catch(e => { })

    let downloadedContent
    if (buffer === undefined) {
      const url = message.message?.stickerMessage?.directPath
      if (typeof url === 'string') {
        downloadedContent = await downloadContentFromMessage({
          mediaKey: message.message?.stickerMessage?.mediaKey,
          directPath: message.message?.stickerMessage?.directPath,
          url: `https://mmg.whatsapp.net${url}`
        },
        'sticker',
        {}
        )
      }
    }

    if (content.mimetype === undefined) {
      throw new MessageError('Message content does not have a mimetype or is not supported')
    }

    return await res
      .header('Content-Cype', content.mimetype)
      .send(buffer ?? downloadedContent)
      .code(200)
  } catch (e) {
    await handleError(e, res, 'An error occured during message media download')
  }
}

export const read: RouteHandler = async (req, res) => {
  try {
    const { session } = req
    const { read_messages: readMessages } = req.body as { read_messages: proto.IMessageKey[] }

    await session.ensureConnected('')

    if (readMessages.length === 0) {
      throw new MessageError('No message to mark as readed')
    }
    await session.session?.readMessages(readMessages)

    return await sendSuccessResponse(res, { success: true })
  } catch (err) {
    await handleError(err, res, 'An error occurred during send a message')
  }
}
