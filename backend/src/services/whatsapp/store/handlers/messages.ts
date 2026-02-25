/* eslint-disable @typescript-eslint/no-misused-promises */
import type { BaileysEventEmitter, MessageUserReceipt, proto, WAMessageKey } from 'baileys'
import { eq, and, inArray } from 'drizzle-orm'
import { db } from '@/db/'
import { chatTable, messagesTable } from '@/db/schema'
import { isPnUser, jidNormalizedUser, toNumber } from 'baileys'
import type { BaileysEventHandler } from '@/types/baileys'
import type { MakeTransformedDrizzle } from '@/types/drizzle'
import { transformDrizzle } from '@/utils/drizzle'
import { emitEvent } from '@/utils/event-emitter'
import { dispatchMondayNotifications } from '@/services/monday-notifications'

const getKeyAuthor = (key: WAMessageKey | undefined | null): string => {
  if (key === undefined && key === null) return ''

  if (key?.fromMe !== undefined && key?.fromMe !== null) return 'me'

  if (key?.participant !== undefined && key?.participant !== null) return key.participant

  if (key?.remoteJid !== undefined && key?.remoteJid !== null) return key.remoteJid

  return ''
}

export default function messageHandler (sessionId: string, workspaceId: string, event: BaileysEventEmitter): { listen: () => void, unlisten: () => void } {
  let listening = false
  const clientId = `${workspaceId}-${sessionId}`

  const set: BaileysEventHandler<'messaging-history.set'> = async ({ messages, isLatest }) => {
    try {
      await db.transaction(async (tx) => {
        if (isLatest === true) {
          await tx
            .delete(messagesTable)
            .where(and(
              eq(messagesTable.sessionId, sessionId),
              eq(messagesTable.workspaceId, workspaceId)
            ))
        }

        const processedMessages = messages.map((message) => {
          const { key: { remoteJid, id } } = message
          if (typeof remoteJid !== 'string') return undefined
          if (typeof id !== 'string') return undefined

          const { deletedAt: _del, ...transformed } = transformDrizzle(message) as any
          return {
            ...transformed,
            remoteJid,
            id,
            sessionId,
            workspaceId
          }
        }).filter(v => v !== undefined)

        if (processedMessages.length === 0) return

        emitEvent('messages.upsert', clientId, { messages: processedMessages })

        // const chunks = [...Array(Math.ceil(processedMessages.length / 200))].map(_ => processedMessages.splice(0, 200))

        for (const message of processedMessages) {
          await tx
            .insert(messagesTable)
            .values(message)
            .onConflictDoUpdate({
              target: [messagesTable.remoteJid, messagesTable.id, messagesTable.sessionId, messagesTable.workspaceId],
              set: {
                ...message
              }
            })
        }
      })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent(
          'messages.upsert',
          clientId,
          undefined,
          'error',
          `An error occured during messages set: ${e.message}`
        )
      }
    }
  }

  const upsert: BaileysEventHandler<'messages.upsert'> = async ({ messages, type }) => {
    switch (type) {
      case 'append':
      case 'notify':
        for (const message of messages) {
          try {
            const { key: { remoteJid, id } } = message
            if (typeof remoteJid !== 'string') return
            if (typeof id !== 'string') return

            const jid = jidNormalizedUser(remoteJid)
            const rawData = transformDrizzle(message) as MakeTransformedDrizzle<typeof messagesTable.$inferInsert>
            const { deletedAt: _del, ...data } = rawData as any

            await db
              .insert(messagesTable)
              .values({
                ...data,
                remoteJid: jid,
                id,
                sessionId,
                workspaceId
              })
              .onConflictDoUpdate({
                target: [messagesTable.remoteJid, messagesTable.id, messagesTable.sessionId, messagesTable.workspaceId],
                set: {
                  ...data
                }
              })

            // const authorID = getKeyAuthor(message.key)
            if (type === 'notify') {
              if (isPnUser(jid) === true) {
                const { remoteJidAlt } = message.key
                if (typeof remoteJidAlt === 'string') {
                  emitEvent('chats.upsert', clientId,
                    {
                      id: remoteJidAlt,
                      conversationTimestamp: toNumber(message.messageTimestamp),
                      unreadCount: 1
                    }
                  )
                }
              }

              emitEvent('chats.upsert', clientId,
                {
                  id: jid,
                  conversationTimestamp: toNumber(message.messageTimestamp),
                  unreadCount: 1
                }
              )

              // dispatchMondayNotifications({
              //   workspaceId,
              //   sessionId,
              //   remoteJid: jid,
              //   fromMe: message.key.fromMe === true
              // }).catch(e => console.error('[MondayNotifications] Background dispatch error:', e))
            }
          } catch (e) {
            if (e instanceof Error) {
              emitEvent(
                'messages.upsert',
                clientId,
                undefined,
                'error',
                `An error occured during message upsert: ${e.message}`
              )
            }
          }
        }
        break
    }
  }

  const update: BaileysEventHandler<'messages.update'> = async (updates): Promise<void> => {
    for (const { update, key } of updates) {
      try {
        await db.transaction(async (tx) => {
          const isInvalidId = key?.id !== undefined && key?.id !== null
          const isInvalidRemoteJid = key?.remoteJid !== undefined && key?.remoteJid !== null

          if (!isInvalidId && !isInvalidRemoteJid) return

          const id = key.id as string
          const remoteJid = key.remoteJid as string

          const { deletedAt: _del, ...transformedUpdate } = transformDrizzle(update) as any

          await tx
            .update(messagesTable)
            .set(transformedUpdate)
            .where(and(
              eq(messagesTable.id, id),
              eq(messagesTable.remoteJid, remoteJid),
              eq(messagesTable.sessionId, sessionId),
              eq(messagesTable.workspaceId, workspaceId)
            ))

          const [updatedMessage] = await tx
            .select()
            .from(messagesTable)
            .where(and(
              eq(messagesTable.id, id),
              eq(messagesTable.remoteJid, remoteJid),
              eq(messagesTable.sessionId, sessionId),
              eq(messagesTable.workspaceId, workspaceId)
            ))
            .limit(1)

          if (updatedMessage === undefined) return

          const processedMessage = {
            ...updatedMessage,
            id,
            remoteJid,
            sessionId,
            workspaceId
          }

          if (remoteJid !== undefined && remoteJid !== null && update.status === 4) {
            const existingChat = await db
              .select()
              .from(chatTable)
              .where(
                and(
                  eq(chatTable.id, remoteJid),
                  eq(chatTable.sessionId, sessionId),
                  eq(chatTable.workspaceId, workspaceId)
                )
              ).limit(1)
            if (existingChat[0] !== undefined) {
              const chat = existingChat[0]
              if ((chat.unreadCount ?? 0) > 0) {
                await db
                  .update(chatTable)
                  .set({
                    unreadCount: 0
                  })
                  .where(
                    and(
                      eq(chatTable.id, remoteJid),
                      eq(chatTable.sessionId, sessionId),
                      eq(chatTable.workspaceId, workspaceId)
                    )
                  )
                emitEvent('chats.update', clientId, { chats: { id: remoteJid, unreadCount: 0 } })
              }
            }
          }
          emitEvent('messages.update', clientId, { messages: processedMessage })
        })
      } catch (e) {
        if (e instanceof Error) {
          emitEvent(
            'messages.update',
            clientId,
            undefined,
            'error',
            `An error occured during message update: ${e.message}`
          )
        }
      }
    }
  }

  const del: BaileysEventHandler<'messages.delete'> = async (item): Promise<void> => {
    try {
      const now = new Date()

      if ('all' in item) {
        await db
          .update(messagesTable)
          .set({ deletedAt: now })
          .where(and(
            eq(messagesTable.remoteJid, item.jid),
            eq(messagesTable.sessionId, sessionId),
            eq(messagesTable.workspaceId, workspaceId)
          ))
        return
      }

      const jid = item.keys[0].remoteJid as string

      const keys = item.keys.filter(c => c.id).map((c) => c.id) as string[]

      await db
        .update(messagesTable)
        .set({ deletedAt: now })
        .where(
          and(
            inArray(messagesTable.id, keys),
            eq(messagesTable.remoteJid, jid),
            eq(messagesTable.sessionId, sessionId),
            eq(messagesTable.workspaceId, workspaceId)
          )
        )
      emitEvent('messages.delete', clientId, { message: item })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent(
          'messages.delete',
          clientId,
          undefined,
          'error',
          `An error occured during message delete: ${e.message}`
        )
      }
    }
  }

  const updateReceipt: BaileysEventHandler<'message-receipt.update'> = async (updates) => {
    for (const { key, receipt } of updates) {
      try {
        await db.transaction(async (tx) => {
          const { id = undefined, remoteJid = undefined } = key

          if ((id === undefined || id === null)) return
          if ((remoteJid === undefined || remoteJid === null)) return

          const [message] = await tx
            .select()
            .from(messagesTable)
            .where(
              and(
                eq(messagesTable.id, id),
                eq(messagesTable.remoteJid, remoteJid),
                eq(messagesTable.sessionId, sessionId),
                eq(messagesTable.workspaceId, workspaceId)
              )
            ).limit(1)

          if (message === null && message === undefined) {
            return
          }

          let userReceipt = (message?.userReceipt ?? []) as MessageUserReceipt[]
          const recepient = userReceipt.find((m) => m.userJid === receipt.userJid)

          if (recepient !== null && receipt !== undefined) {
            userReceipt = [
              ...userReceipt.filter((m) => m.userJid !== receipt.userJid),
              receipt
            ]
          } else {
            userReceipt.push(receipt)
          }

          await tx
            .update(messagesTable)
            .set(transformDrizzle({ userReceipt }))
            .where(
              and(
                eq(messagesTable.id, id),
                eq(messagesTable.remoteJid, remoteJid),
                eq(messagesTable.sessionId, sessionId),
                eq(messagesTable.workspaceId, workspaceId)
              )
            )

          if (remoteJid !== undefined && remoteJid !== null) {
            const existingChat = await db
              .select()
              .from(chatTable)
              .where(
                and(
                  eq(chatTable.id, remoteJid),
                  eq(chatTable.sessionId, sessionId),
                  eq(chatTable.workspaceId, workspaceId)
                )
              ).limit(1)
            if (existingChat[0] !== undefined) {
              const chat = existingChat[0]
              console.log('Existing chat found for receipt update:', chat)
              if ((chat.unreadCount ?? 0) > 0) {
                await db
                  .update(chatTable)
                  .set({
                    unreadCount: 0
                  })
                  .where(
                    and(
                      eq(chatTable.id, remoteJid),
                      eq(chatTable.sessionId, sessionId),
                      eq(chatTable.workspaceId, workspaceId)
                    )
                  )
                emitEvent('chats.update', clientId, { chats: { id: remoteJid, unreadCount: 0 } })
              }
            }
          }
        })
        emitEvent('message-receipt.update', clientId, { message: { key, receipt } })
      } catch (e) {
        if (e instanceof Error) {
          emitEvent(
            'message-receipt.update',
            clientId,
            undefined,
            'error',
            `An error occured during message receipt update: ${e.message}`
          )
        }
      }
    }
  }

  const updateReaction: BaileysEventHandler<'messages.reaction'> = async (reactions): Promise<void> => {
    for (const { key, reaction } of reactions) {
      try {
        await db.transaction(async (tx) => {
          const { id = undefined, remoteJid = undefined } = key

          if ((id === undefined || id === null)) return
          if ((remoteJid === undefined || remoteJid === null)) return

          const [message] = await tx
            .select()
            .from(messagesTable)
            .where(
              and(
                eq(messagesTable.id, id),
                eq(messagesTable.remoteJid, remoteJid),
                eq(messagesTable.sessionId, sessionId),
                eq(messagesTable.workspaceId, workspaceId)
              )
            ).limit(1)

          if (message === null && message === undefined) {
            return
          }

          const authorID = getKeyAuthor(reaction.key)
          const reactions = ((message.reactions ?? []) as proto.IReaction[])
            .filter((r: proto.IReaction) => getKeyAuthor(r.key) !== authorID)

          if (reaction.text !== null && reaction.text !== undefined) reactions.push(reaction)

          await tx
            .update(messagesTable)
            .set(transformDrizzle({ reactions }))
            .where(and(
              eq(messagesTable.id, id),
              eq(messagesTable.remoteJid, remoteJid),
              eq(messagesTable.sessionId, sessionId),
              eq(messagesTable.workspaceId, workspaceId)
            ))
          emitEvent('messages.reaction', clientId, { message: { key, reaction } })
        })
      } catch (e) {
        if (e instanceof Error) {
          emitEvent(
            'messages.reaction',
            clientId,
            undefined,
            'error',
            `An error occured during message reaction update: ${e.message}`
          )
        }
      }
    }
  }

  const listen = (): void => {
    if (listening) return

    event.on('messaging-history.set', set)
    event.on('messages.upsert', upsert)
    event.on('messages.update', update)
    event.on('messages.delete', del)
    event.on('message-receipt.update', updateReceipt)
    event.on('messages.reaction', updateReaction)
    listening = true
  }

  const unlisten = (): void => {
    if (!listening) return

    event.off('messaging-history.set', set)
    event.off('messages.upsert', upsert)
    event.off('messages.update', update)
    event.off('messages.delete', del)
    event.off('message-receipt.update', updateReceipt)
    event.off('messages.reaction', updateReaction)
    listening = false
  }

  return { listen, unlisten }
}
