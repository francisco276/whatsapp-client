import { db } from '@/db'
import { authorizationTable } from '@/db/schema'
import { NotFoundError } from '@/errors/errors'
import { and, eq } from 'drizzle-orm'

export type Authorization = typeof authorizationTable.$inferSelect

export async function getAuthorizationUser ({ userId, workspaceId }: { userId: string, workspaceId: string }): Promise<Authorization> {
  try {
    const authorizationUsers = await db
      .select()
      .from(authorizationTable)
      .where(and(
        eq(authorizationTable.userId, userId),
        eq(authorizationTable.workspaceId, workspaceId)
      ))
      .limit(1)

    if (authorizationUsers.length === 0) {
      throw new NotFoundError('User not exist')
    }
    const [authorization] = authorizationUsers

    return authorization
  } catch (error) {
    throw new Error('Error on fetch element')
  }
}
