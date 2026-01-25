import type { RouteHandler } from 'fastify'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/db'
import { chatTable } from '@/db/schema'
import { handleError } from '@/helpers/errorHandler'
import { sendSuccessResponse } from '@/helpers/responses'
import { validateChatBody } from '@/validations/body'

export const list: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req

  try {
    const chats = await db
      .select({
        pkId: chatTable.pkId,
        id: chatTable.id,
        name: chatTable.name,
        description: chatTable.description,
        lastMessageRecvTimestamp: chatTable.lastMessageRecvTimestamp,
        unreadCount: chatTable.unreadCount
      })
      .from(chatTable)
      .where(and(
        eq(chatTable.workspaceId, workspace.id),
        eq(chatTable.sessionId, session.sessionId)
      )).orderBy(
        desc(chatTable.conversationTimestamp)
      )

    await sendSuccessResponse(res, { chats })
  } catch (e) {
    await handleError(e, res)
  }
}

export const find: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req
  const { id } = validateChatBody(req)

  try {
    const chats = await db
      .select({
        pkId: chatTable.pkId,
        id: chatTable.id,
        name: chatTable.name,
        description: chatTable.description,
        lastMessageRecvTimestamp: chatTable.lastMessageRecvTimestamp

      })
      .from(chatTable)
      .where(and(
        eq(chatTable.id, id),
        eq(chatTable.workspaceId, workspace.id),
        eq(chatTable.sessionId, session.sessionId)
      ))

    await sendSuccessResponse(res, { chats })
  } catch (e) {
    await handleError(e, res)
  }
}

export const del: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req
  const { id } = validateChatBody(req)

  try {
    await db.delete(chatTable).where(
      and(
        eq(chatTable.id, id),
        eq(chatTable.workspaceId, workspace.id),
        eq(chatTable.sessionId, session.sessionId)
      )
    )

    await sendSuccessResponse(res, null, 'Chat deleted successfully')
  } catch (error) {
    await handleError(error, res)
  }
}

export const read: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req
  const { id } = validateChatBody(req)

  try {
    const chats = await db
      .update(chatTable)
      .set({ unreadCount: 0 })
      .where(
        and(
          eq(chatTable.id, id),
          eq(chatTable.workspaceId, workspace.id),
          eq(chatTable.sessionId, session.sessionId)
        )
      ).returning()
    await sendSuccessResponse(res, { chats })
  } catch (error) {
    await handleError(error, res)
  }
}
