import { and, eq, inArray, isNotNull, notLike } from 'drizzle-orm'
import WhatsAppService from './whatsapp/service'
import { db } from '@/db'
import { sessionAccessTable, sessionTable } from '@/db/schema'
import { NotFoundError } from '@/errors/errors'
import { getAuthorizationUser } from './authorizations'

export class Workspace {
  public id: string
  public name: string
  public sessions: Map<string, WhatsAppService> = new Map()

  constructor ({ id, name }: { id: string, name: string }) {
    this.id = id
    this.name = name
    this.getSessions().catch(() => console.log('error on get sessions'))
  }

  async getSessions (): Promise<void> {
    const storedSession = await db
      .selectDistinctOn([sessionTable.sessionId])
      .from(sessionTable)
      .where(
        and(
          eq(sessionTable.workspaceId, this.id),
          isNotNull(sessionTable.createdBy)
        )
      )

    for (const { sessionId, isSynced, createdBy } of storedSession) {
      try {
        await this.addSession({ sessionId, isSynced, userId: createdBy })
      } catch (error) {
        if (this.sessionExists(sessionId)) {
          await this.deleteSession(sessionId)
        }
      }
    }
  }

  async addSession ({ sessionId, insert = false, isSynced, userId }: { sessionId: string, insert?: boolean, isSynced: boolean, userId: string }): Promise<string> {
    const session = new WhatsAppService({ sessionId, workspaceId: this.id, isSynced })

    try {
      const qr = await session.addSession(userId, insert, () => {
        this.sessions.set(sessionId, session)

        if (insert) {
          db
            .insert(sessionAccessTable)
            .values({
              sessionId,
              workspaceId: this.id,
              grantedBy: userId,
              userId
            }).catch(() => {})
        }
      })

      return qr
    } catch (error) {
      console.log(error)
      this.sessions.delete(sessionId)
      throw new Error('Session not created try again')
    }
  }

  async listSessions ({ userId }: { userId: string }): Promise<Array<{ id: string, isSynced: boolean, status: string | undefined }>> {
    const user = await getAuthorizationUser({ workspaceId: this.id, userId })

    const sessions = await db
      .select()
      .from(sessionAccessTable)
      .where(
        and(
          eq(sessionAccessTable.workspaceId, this.id),
          eq(sessionAccessTable.userId, userId)
        )
      )

    const sessionsId = sessions.map(s => s.sessionId)

    const filters = [
      eq(sessionTable.workspaceId, this.id),
      isNotNull(sessionTable.isSynced),
      isNotNull(sessionTable.createdBy),
      notLike(sessionTable.createdBy, '')
    ]

    const isAdmin = user.role === 'admin'

    if (!isAdmin) {
      inArray(sessionTable.sessionId, sessionsId)
    }

    const storedSession = await db
      .selectDistinctOn([sessionTable.sessionId])
      .from(sessionTable)
      .where(
        and(
          ...filters
        )
      )

    storedSession.forEach(session => {
      if (this.sessionExists(session.sessionId)) {
        this.getSession(session.sessionId)?.updateSyncStatus(session.isSynced)
      }
    })

    const currentSessions = Array.from(this.sessions.entries()).map(([id, session]) => ({
      id,
      isSynced: session.isSynced,
      status: session.session?.waStatus
    }))

    if (!isAdmin) {
      return currentSessions.filter(session => sessionsId.includes(session.id))
    }

    return currentSessions
  }

  getSession (sessionId: string): WhatsAppService {
    const session = this.sessions.get(sessionId)

    if (session === undefined) {
      throw new NotFoundError('Session not found')
    }

    return session
  }

  async deleteSession (sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId)
    if (session === undefined) {
      throw new NotFoundError('Session not found')
    }

    if (session.connectionState.connection === 'open') {
      await session.destroy()
    }
    this.sessions.delete(sessionId)
  }

  sessionExists (sessionId: string): boolean {
    return this.sessions.has(sessionId)
  }

  deleteAllSession (): void {
    for (const session of this.sessions) {
      const [sessionId] = session
      this.deleteSession(sessionId).then(() => console.log('sessions deleted')).catch(() => console.log('error on delete'))
    }
  }
}
