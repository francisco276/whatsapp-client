import type { FastifyRequest, FastifyReply } from 'fastify'
import { UserPreferencesConfig } from '@/types/preferences'
import { db } from '@/db'
import { preferencesTable } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { sendSuccessResponse } from '@/helpers/responses'
import { handleError } from '@/helpers/errorHandler'

interface UpdatePreferencesBody {
  userId: string
  workspaceId: string
  config: Partial<UserPreferencesConfig>
}

interface GetPreferencesBody {
  userId: string
  workspaceId: string
}

export const get = async (request: FastifyRequest<{ Body: GetPreferencesBody }>, reply: FastifyReply): Promise<any> => {
  try {
    const { user: { userId } } = request
    const { workspaceId } = request.body
    const [preferences] = await db
      .select()
      .from(preferencesTable)
      .where(and(
        eq(preferencesTable.userId, userId),
        eq(preferencesTable.workspaceId, workspaceId)
      ))
    if (preferences === undefined) {
      const [preferences] = await db
        .insert(preferencesTable)
        .values({
          userId,
          workspaceId
        })
        .returning()
      return await sendSuccessResponse(reply, preferences.config)
    }
    sendSuccessResponse(reply, preferences.config)
  } catch (error) {
    handleError(error, reply, 'Failed to retrieve preferences')
  }
}

export const update = async (request: FastifyRequest<{ Body: UpdatePreferencesBody }>, reply: FastifyReply): Promise<any> => {
  const { user: { userId } } = request
  const { workspaceId, config: newConfigPartial } = request.body

  try {
    let [userPrefs] = await db
      .select()
      .from(preferencesTable)
      .where(and(
        eq(preferencesTable.userId, userId),
        eq(preferencesTable.workspaceId, workspaceId)
      ))

    if (userPrefs === undefined) {
      [userPrefs] = await db
        .insert(preferencesTable)
        .values({
          userId,
          workspaceId
        })
        .returning()
    }

    const mergedConfig: UserPreferencesConfig = {
      ...userPrefs.config,
      ...newConfigPartial,
      notifications: {
        ...userPrefs.config.notifications,
        ...(newConfigPartial.notifications ?? {})
      },
      privacy: {
        ...userPrefs.config.privacy,
        ...(newConfigPartial.privacy ?? {})
      }
    }

    const [updatedPreference] = await db
      .update(preferencesTable)
      .set({ config: mergedConfig })
      .where(and(
        eq(preferencesTable.userId, userId),
        eq(preferencesTable.workspaceId, workspaceId)
      )).returning()

    sendSuccessResponse(reply, updatedPreference.config)
  } catch (error) {
    handleError(error, reply, 'Failed to update preferences')
  }
}
