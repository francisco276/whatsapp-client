import type { RouteHandler } from 'fastify'
import { eq, and, desc } from 'drizzle-orm'
import { db } from '@/db'
import { contactTable } from '@/db/schema'
import { handleError } from '@/helpers/errorHandler'
import { sendSuccessResponse } from '@/helpers/responses'
import { isLidUser } from 'baileys'

export const list: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req
  try {
    const contacts = await db
      .select()
      .from(contactTable)
      .where(and(
        eq(contactTable.workspaceId, workspace.id),
        eq(contactTable.sessionId, session.sessionId)
      )).orderBy(
        desc(contactTable.name)
      )

    await sendSuccessResponse(res, { contacts })
  } catch (e) {
    await handleError(e, res)
  }
}

export const find: RouteHandler = async (req, res): Promise<any> => {
  const { workspace, session } = req
  const { id } = req.body as { id: string }

  try {
    const contacts = await db
      .select()
      .from(contactTable)
      .where(and(
        eq(contactTable.id, id),
        eq(contactTable.workspaceId, workspace.id),
        eq(contactTable.sessionId, session.sessionId)
      ))

    const contact = contacts[0]

    if (contact === undefined) {
      return await sendSuccessResponse(res, { contacts: [{ id }] })
    }

    await session.ensureConnected()
    const image = await session.session?.profilePictureUrl(contact.id, 'preview').catch(() => '') ?? ''

    await sendSuccessResponse(res, { contacts: [{ ...contact, image }] })
  } catch (e) {
    await handleError(e, res)
  }
}

export const valid: RouteHandler = async (req, res): Promise<any> => {
  const { session } = req
  const { id } = req.body as { id: string }
  try {
    await session.ensureConnected()

    const exist = await session.jidExists(id)

    await sendSuccessResponse(res, { isValid: exist })
  } catch (error) {
    await handleError(error, res)
  }
}
