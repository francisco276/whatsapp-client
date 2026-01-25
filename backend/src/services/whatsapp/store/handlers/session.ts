/* eslint-disable @typescript-eslint/no-misused-promises */
import { proto, type BaileysEventEmitter } from 'baileys'
import type { BaileysEventHandler } from '@/types/baileys'
import { eq, and } from 'drizzle-orm'
import { db } from '@/db/'
import { sessionTable } from '@/db/schema'
import { emitEvent } from '@/utils/event-emitter'

const SYNC_TYPES = proto.HistorySync.HistorySyncType

export default function sessionSyncHandler (sessionId: string, workspaceId: string, event: BaileysEventEmitter): { listen: () => void, unlisten: () => void } {
  let listening = false
  let syncTimeout: NodeJS.Timeout | null = null
  const clientId = `${workspaceId}-${sessionId}`

  // Function to handle when sync events don't arrive
  const startSyncTimeout = (timeout = 30000): void => {
    if (syncTimeout !== null) {
      clearTimeout(syncTimeout)
    }

    syncTimeout = setTimeout(async () => {
      try {
        await db
          .update(sessionTable)
          .set({
            isSynced: false
          })
          .where(
            and(
              eq(sessionTable.sessionId, sessionId),
              eq(sessionTable.workspaceId, workspaceId)
            )
          )

        // Emit sync timeout event to frontend
        emitEvent('messaging-history.set', clientId, {
          isSynced: false,
          syncType: 'timeout',
          isLatest: false
        })
      } catch (e) {
        if (e instanceof Error) {
          emitEvent('messaging-history.set', clientId, undefined, 'error', `An error occurred during sync timeout: ${e.message}`)
        }
      }
    }, timeout)
  }

  const messagingHistorySet: BaileysEventHandler<'messaging-history.set'> = async ({ syncType, isLatest, progress }) => {
    try {
      // Clear any existing timeout since we received an event
      if (syncTimeout !== null) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }

      console.log('Sync Funtion', { syncType, isLatest, progress })
      const isValidToChangeSyncStatusToFalse = SYNC_TYPES.NON_BLOCKING_DATA === syncType || SYNC_TYPES.ON_DEMAND === syncType || SYNC_TYPES.PUSH_NAME === syncType

      const isFullSync = syncType === SYNC_TYPES.FULL || syncType === SYNC_TYPES.RECENT || syncType === SYNC_TYPES.INITIAL_BOOTSTRAP || syncType === SYNC_TYPES.INITIAL_STATUS_V3
      const isCompleteProgress = (typeof progress === 'number') && progress === 100
      const isValidToChangeSyncStatus = (isFullSync && isCompleteProgress)

      if (isValidToChangeSyncStatus || isValidToChangeSyncStatusToFalse) {
        startSyncTimeout(200)
        return
      }

      // Update session to indicate sync is in progress (user needs to wait)
      await db
        .update(sessionTable)
        .set({
          isSynced: true
        })
        .where(
          and(
            eq(sessionTable.sessionId, sessionId),
            eq(sessionTable.workspaceId, workspaceId)
          )
        )

      emitEvent('messaging-history.set', clientId, { isSynced: true, syncType, isLatest })
    } catch (e) {
      if (e instanceof Error) {
        emitEvent('messaging-history.set', clientId, undefined, 'error', `An error occurred during session sync: ${e.message}`)
      }
    }
  }

  const listen = (): void => {
    if (listening) return

    event.on('messaging-history.set', messagingHistorySet)
    listening = true

    startSyncTimeout()
  }

  const unlisten = (): void => {
    if (!listening) return

    event.off('messaging-history.set', messagingHistorySet)
    listening = false

    if (syncTimeout !== null) {
      clearTimeout(syncTimeout)
      syncTimeout = null
    }
  }

  return { listen, unlisten }
}
