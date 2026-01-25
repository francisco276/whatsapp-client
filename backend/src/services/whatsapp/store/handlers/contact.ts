/* eslint-disable @typescript-eslint/no-misused-promises */
import type { BaileysEventEmitter } from 'baileys'
import type { BaileysEventHandler } from '@/types/baileys'
import { db } from '@/db/'
import { and, eq } from 'drizzle-orm'
import { contactTable } from '@/db/schema'
import { transformDrizzle } from '@/utils/drizzle'

export default function contactHandler (sessionId: string, workspaceId: string, event: BaileysEventEmitter): { listen: () => void, unlisten: () => void } {
  let listening = false

  const set: BaileysEventHandler<'messaging-history.set'> = async ({ contacts }): Promise<void> => {
    try {
      const processedContacts = contacts.map((c) => ({ ...transformDrizzle(c), sessionId, workspaceId }))

      const promises = processedContacts.map((data) => db
        .insert(contactTable)
        .values(data)
        // .onConflictDoNothing()
        .onConflictDoUpdate({
          target: [contactTable.id, contactTable.sessionId],
          set: { ...data, sessionId, workspaceId }
        })
      )

      await Promise.all(promises)
    } catch (e) {
      console.log(e)
    }
  }

  const upsert: BaileysEventHandler<'contacts.upsert'> = async (contacts): Promise<void> => {
    try {
      if (contacts.length === 0) return

      const processedContacts = contacts
        .map((contact) => ({ ...transformDrizzle(contact), sessionId, workspaceId }))

      await db
        .insert(contactTable)
        .values(processedContacts)
        .onConflictDoNothing()
    } catch (error) {
      console.log('Error on updates contacts')
    }
  }

  const update: BaileysEventHandler<'contacts.update'> = async (updates): Promise<void> => {
    for (const update of updates) {
      try {
        const data = transformDrizzle(update)
        if (data.id === undefined) continue

        await db
          .update(contactTable)
          .set(data)
          .where(and(
            eq(contactTable.id, data.id),
            eq(contactTable.sessionId, sessionId),
            eq(contactTable.workspaceId, workspaceId)
          ))
      } catch (e) {
        console.log({ e }, 'update contact')
      }
    }
  }

  const listen = (): void => {
    if (listening) return
    event.on('messaging-history.set', set)
    event.on('contacts.upsert', upsert)
    event.on('contacts.update', update)
    listening = true
  }

  const unlisten = (): void => {
    if (!listening) return

    event.off('messaging-history.set', set)
    event.off('contacts.upsert', upsert)
    event.off('contacts.update', update)
    listening = false
  }
  return {
    listen,
    unlisten
  }
}
