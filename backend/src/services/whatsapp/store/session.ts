/* eslint-disable @typescript-eslint/array-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { eq, and } from 'drizzle-orm'
import {
  type AuthenticationState,
  type AuthenticationCreds,
  type SignalKeyStore,
  BufferJSON,
  initAuthCreds,
  SignalDataTypeMap,
  proto
} from 'baileys'
import { db } from '@/db'
import { sessionTable } from '@/db/schema'

const fixId = (id: string): string => id.replace(/\//g, '__').replace(/:/g, '-')

export const useSession = async (sessionId: string, workspaceId: string): Promise<{ state: AuthenticationState, saveCreds: () => Promise<void> }> => {
  const write = async (data: any, id: string): Promise<void> => {
    try {
      id = fixId(id)
      data = JSON.stringify(data, BufferJSON.replacer)

      await db.insert(sessionTable).values({
        id,
        workspaceId,
        sessionId,
        data: data as string,
        createdBy: ''
      }).onConflictDoUpdate({
        target: [sessionTable.sessionId, sessionTable.id],
        set: { data: data as string }
      })
    } catch (e) {
      console.log(e, 'write')
    }
  }

  const read = async (id: string): Promise<any> => {
    try {
      id = fixId(id)
      const [session] = await db
        .select()
        .from(sessionTable)
        .where(and(
          eq(sessionTable.id, id),
          eq(sessionTable.sessionId, sessionId),
          eq(sessionTable.workspaceId, workspaceId)
        ))

      if (session === null || session === undefined) {
        return null
      }

      return JSON.parse(session.data, BufferJSON.reviver) as AuthenticationCreds
    } catch (e) {
      console.log(e, 'read')
    }
  }

  const del = async (id: string): Promise<void> => {
    try {
      id = fixId(id)
      await db
        .delete(sessionTable)
        .where(and(
          eq(sessionTable.id, id),
          eq(sessionTable.sessionId, sessionId),
          eq(sessionTable.workspaceId, workspaceId)
        ))
    } catch (e) {
      console.log(e, 'del')
    }
  }

  const creds: AuthenticationCreds = await read('creds') || initAuthCreds()

  const keys: SignalKeyStore = {
    get: async <T extends keyof SignalDataTypeMap>(type: T, ids: string[]): Promise<{ [id: string]: SignalDataTypeMap[T] }> => {
      const data: { [key: string]: SignalDataTypeMap[typeof type] } = {}
      await Promise.all(
        ids.map(async (id) => {
          let value = await read(`${type}-${id}`)
          if (type === 'app-state-sync-key' && value) {
            value = proto.Message.AppStateSyncKeyData.fromObject(value)
          }
          data[id] = value
        })
      )
      return data
    },
    set: async (data: any): Promise<void> => {
      const tasks: Promise<void>[] = []

      for (const category in data) {
        for (const id in data[category]) {
          const value = data[category][id]
          const sId = `${category}-${id}`
          tasks.push(value ? write(value, sId) : del(sId))
        }
      }
      await Promise.all(tasks)
    }
  }

  const state: AuthenticationState = {
    creds,
    keys
  }

  return {
    state,
    saveCreds: async () => await write(creds, 'creds')
  }
}
