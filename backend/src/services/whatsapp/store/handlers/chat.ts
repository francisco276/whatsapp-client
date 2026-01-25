/* eslint-disable @typescript-eslint/no-misused-promises */
import { type BaileysEventEmitter } from 'baileys'
import type { BaileysEventHandler } from '@/types/baileys'
import { inArray, eq, and } from 'drizzle-orm'
import { db } from '@/db/'
import { chatTable, messagesTable } from '@/db/schema'
import { transformDrizzle } from '@/utils/drizzle'
import { MakeTransformedDrizzle } from '@/types/drizzle'
import { emitEvent } from '@/utils/event-emitter'

type InserChat = typeof chatTable.$inferInsert

export default function chatHandler (sessionId: string, workspaceId: string, event: BaileysEventEmitter): { listen: () => void, unlisten: () => void } {
  let listening = false
  const clientId = `${workspaceId}-${sessionId}`

  const set: BaileysEventHandler<'messaging-history.set'> = async ({ chats, isLatest, contacts }) => {
    try {
      await db.transaction(async (tx) => {
        if (isLatest === true) await tx.delete(chatTable).where(eq(chatTable.sessionId, sessionId))

        const ids = chats.filter(c => typeof c.id === 'string').map(c => c.id as string)

        const existingChats = await tx
          .select({
            id: chatTable.id
          })
          .from(chatTable)
          .where(and(
            inArray(chatTable.id, ids),
            eq(chatTable.sessionId, sessionId),
            eq(chatTable.workspaceId, workspaceId)
          ))

        const existingIds = existingChats.map(c => c.id)

        const processedChats = chats
          .filter(({ id }) => (typeof id === 'string') && !existingIds.includes(id))
          .map(c => {
            const transformed = transformDrizzle(c)
            if (transformed.id === undefined) return null

            return {
              ...transformed,
              workspaceId,
              sessionId,
              conversationTimestamp: typeof c.conversationTimestamp === 'object' ? undefined : c.conversationTimestamp,
              createdAt: typeof c.createdAt === 'object' ? undefined : c.createdAt,
              ephemeralExpiration: typeof c.ephemeralExpiration === 'object' ? undefined : c.ephemeralExpiration,
              ephemeralSettingTimestamp: typeof c.ephemeralSettingTimestamp === 'object' ? undefined : c.ephemeralSettingTimestamp,
              lastMsgTimestamp: typeof c.lastMsgTimestamp === 'object' ? undefined : c.lastMsgTimestamp,
              muteEndTime: typeof c.muteEndTime === 'object' ? undefined : c.muteEndTime,
              tcTokenSenderTimestamp: typeof c.tcTokenSenderTimestamp === 'object' ? undefined : c.tcTokenSenderTimestamp,
              tcTokenTimestamp: typeof c.tcTokenTimestamp === 'object' ? undefined : c.tcTokenTimestamp
            }
          }) as InserChat[]

        if (processedChats.length === 0) return

        await tx.insert(chatTable).values(processedChats)
        emitEvent('chats.set', clientId, { chats: processedChats })
      })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent('chats.set', clientId, undefined, 'error', `An error occured during chats set: ${e.message}`)
      }
    }
  }

  const upsert: BaileysEventHandler<'chats.upsert'> = async (chats) => {
    try {
      const chatsTransformed = chats.map(c => transformDrizzle(c))
        .map(c => ({
          ...c,
          conversationTimestamp: typeof c.conversationTimestamp === 'object' ? undefined : c.conversationTimestamp,
          createdAt: typeof c.createdAt === 'object' ? undefined : c.createdAt,
          ephemeralExpiration: typeof c.ephemeralExpiration === 'object' ? undefined : c.ephemeralExpiration,
          ephemeralSettingTimestamp: typeof c.ephemeralSettingTimestamp === 'object' ? undefined : c.ephemeralSettingTimestamp,
          lastMsgTimestamp: typeof c.lastMsgTimestamp === 'object' ? undefined : c.lastMsgTimestamp,
          muteEndTime: typeof c.muteEndTime === 'object' ? undefined : c.muteEndTime,
          tcTokenSenderTimestamp: typeof c.tcTokenSenderTimestamp === 'object' ? undefined : c.tcTokenSenderTimestamp,
          tcTokenTimestamp: typeof c.tcTokenTimestamp === 'object' ? undefined : c.tcTokenTimestamp,
          workspaceId,
          sessionId
        })) as InserChat[]

      for (const data of chatsTransformed) {
        await db.insert(chatTable)
          .values(data)
          .onConflictDoUpdate({
            target: [chatTable.pkId, chatTable.sessionId, chatTable.workspaceId],
            set: { ...data, sessionId, workspaceId }
          })
      }
      emitEvent('chats.upsert', clientId, { chats: chatsTransformed })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent('chats.upsert', clientId, undefined, 'error', `An error occured during chats upsert: ${e.message}`)
      }
    }
  }

  const update: BaileysEventHandler<'chats.update'> = async (updates) => {
    for (const update of updates) {
      try {
        const data = transformDrizzle(update) as MakeTransformedDrizzle<typeof chatTable.$inferInsert>
        const { id } = data

        if (id === undefined) {
          continue
        }

        const existingChat = await db
          .select()
          .from(chatTable)
          .where(
            and(
              eq(chatTable.id, id),
              eq(chatTable.sessionId, sessionId),
              eq(chatTable.workspaceId, workspaceId)
            )
          ).limit(1)

        if (existingChat.length === 0) {
          continue
        }
        const chat = existingChat[0]

        let unreadCountUpdate = 0
        if (typeof data.unreadCount === 'number') {
          unreadCountUpdate = data.unreadCount > 0 ? (data.unreadCount + (chat.unreadCount ?? 0)) : data.unreadCount
        }

        await db
          .update(chatTable)
          .set({
            ...data,
            ...(unreadCountUpdate !== undefined && {
              unreadCount: unreadCountUpdate
            })
          })
          .where(
            and(
              eq(chatTable.id, id),
              eq(chatTable.sessionId, sessionId),
              eq(chatTable.workspaceId, workspaceId)
            )
          )
          .returning({ pkId: chatTable.pkId })
        emitEvent('chats.update', clientId, { chats: data })
      } catch (e) {
        if (e instanceof Error) {
          emitEvent('chats.update', clientId, undefined, 'error', `An error occured during chats update: ${e.message}`)
        }
      }
    }
  }

  const del: BaileysEventHandler<'chats.delete'> = async (ids) => {
    try {
      await db
        .delete(chatTable)
        .where(inArray(chatTable.id, ids))
      await db
        .delete(messagesTable)
        .where(inArray(messagesTable.remoteJid, ids))
      emitEvent('chats.delete', clientId, { chats: ids })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent('chats.delete', clientId, undefined, 'error', `An error occured during chats delete: ${e.message}`)
      }
    }
  }

  const listen = (): void => {
    if (listening) return

    event.on('messaging-history.set', set)
    event.on('chats.upsert', upsert)
    event.on('chats.update', update)
    event.on('chats.delete', del)
    listening = true
  }

  const unlisten = (): void => {
    if (!listening) return

    event.off('messaging-history.set', set)
    event.off('chats.upsert', upsert)
    event.off('chats.update', update)
    event.off('chats.delete', del)
    listening = false
  }

  return { listen, unlisten }
}
