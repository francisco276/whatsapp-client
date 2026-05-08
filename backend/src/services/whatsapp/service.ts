import makeWASocket, { DisconnectReason, isLidUser, fetchLatestBaileysVersion } from 'baileys'
import type { WASocket, ConnectionState } from 'baileys'
import type { Boom } from '@hapi/boom'
import { toDataURL } from 'qrcode'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { chatTable, contactTable, messagesTable, sessionTable } from '@/db/schema'
import { useSession, Store } from './store'
import { WAStatus } from '@/types/WAStatus'
import { emitEvent } from '@/utils/event-emitter'
import { WorkspaceManager } from '@/services/WorkspacesManager'

export type Session = WASocket & {
  store: Store
  waStatus?: WAStatus
}

class WhatsAppService {
  private readonly workspaceId: string
  public readonly sessionId: string
  public session: Session | undefined
  private retries: number = 0
  public connectionState: Partial<ConnectionState> = { connection: 'close' }
  private socket: WASocket | undefined
  clientId: string
  public isSynced: boolean

  constructor ({ sessionId, workspaceId, isSynced }: { sessionId: string, workspaceId: string, isSynced: boolean }) {
    this.sessionId = sessionId
    this.workspaceId = workspaceId
    this.clientId = `${workspaceId}-${sessionId}`
    this.isSynced = isSynced
  }

  updateWaConnection (waStatus: WAStatus): void {
    if (this.session !== undefined && this.session !== null) {
      this.session = { ...this.session, waStatus }
    }
  }

  async destroy (logout = true): Promise<void> {
    try {
      await Promise.all([
        logout && this.socket?.logout(),
        db.delete(sessionTable).where(and(eq(sessionTable.sessionId, this.sessionId), eq(sessionTable.workspaceId, this.workspaceId))),
        db.delete(chatTable).where(and(eq(chatTable.sessionId, this.sessionId), eq(chatTable.workspaceId, this.workspaceId))),
        db.delete(contactTable).where(and(eq(contactTable.sessionId, this.sessionId), eq(contactTable.workspaceId, this.workspaceId))),
        db.delete(messagesTable).where(and(eq(messagesTable.sessionId, this.sessionId), eq(messagesTable.workspaceId, this.workspaceId)))
      ])

      if (WorkspaceManager.exist(this.workspaceId)) {
        const workspace = await WorkspaceManager.getWorkspace(this.workspaceId)
        if (workspace.sessionExists(this.sessionId)) await workspace?.deleteSession(this.sessionId)
      }
    } catch (e) {
      console.log(e, 'error on destroy')
    } finally {
      this.updateWaConnection(WAStatus.Disconected)
    }
  }

  async handleConnectionClose (createdBy: string, insert?: boolean, callback: () => void = () => { }): Promise<void> {
    const code = (this.connectionState.lastDisconnect?.error as Boom)?.output?.statusCode
    const restartRequired = code === DisconnectReason.restartRequired || code === DisconnectReason.connectionLost
    const doNotReconnect = !this.shouldReconnect()

    this.updateWaConnection(WAStatus.Disconected)

    if (code === DisconnectReason.loggedOut || doNotReconnect) {
      this.destroy(doNotReconnect).catch(console.error)
      return
    }

    if (code === undefined) {
      await this.destroy(doNotReconnect).catch(console.error)
    }

    if (code === DisconnectReason.timedOut && insert === true) {
      emitEvent(
        'connection.update',
        this.clientId,
        undefined,
        'error',
        'An error occured during createing the session. Please try again later.'
      )
      this.destroy(doNotReconnect).catch(console.error)
      return
    }

    if (code === DisconnectReason.forbidden || code === DisconnectReason.connectionClosed) {
      this.updateWaConnection(WAStatus.Disconected)
    }

    if (restartRequired || code === DisconnectReason.forbidden || code === DisconnectReason.connectionClosed) {
      setTimeout(() => {
        this.addSession(createdBy, insert, callback).catch(console.error)
      }, restartRequired ? 0 : 30000)
    }
  }

  async handleConnectionUpdate (): Promise<string | undefined> {
    const qrState = this.connectionState.qr
    const isValid = typeof qrState === 'string' && qrState.length > 0

    if (isValid) {
      try {
        const qr = await toDataURL(qrState)
        this.updateWaConnection(WAStatus.WaitQrcodeAuth)
        emitEvent('qrcode.updated', this.clientId, { qr })
        return qr
      } catch (error) {
        this.destroy().catch(console.error)
        throw new Error('Unable to generate QR')
      }
    }
    return undefined // This is because is not necesary a new qr
  }

  async addSession (createdBy: string, insert?: boolean, callback: () => void = () => { }): Promise<any> {
    const { state, saveCreds } = await useSession(this.sessionId, this.workspaceId)

    const { version } = await fetchLatestBaileysVersion().catch(() => ({
      version: [2, 3000, 1030761119] as [number, number, number]
    }))

    this.socket = makeWASocket({
      browser: ['Monday', 'Monday App', 'Monday Integration'],
      auth: state,
      version,
      syncFullHistory: true,
      generateHighQualityLinkPreview: true,
      connectTimeoutMs: undefined,
      linkPreviewImageThumbnailWidth: 40,
      retryRequestDelayMs: 350,
      maxMsgRetryCount: 4
    })

    const store = new Store(this.sessionId, this.workspaceId, this.socket.ev)

    this.session = {
      ...this.socket,
      store,
      waStatus: WAStatus.Unknown
    }

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    this.socket.ev.on('creds.update', saveCreds)

    await db.insert(sessionTable).values({
      id: 'creds',
      workspaceId: this.workspaceId,
      sessionId: this.sessionId,
      data: JSON.stringify({}),
      createdBy
    }).onConflictDoNothing()

    const qrPromise = new Promise((resolve, reject) => {
      let settled = false

      const done = (value?: any) => {
        if (settled) return
        settled = true
        clearTimeout(qrTimeout)
        resolve(value)
      }

      const fail = (error: Error) => {
        if (settled) return
        settled = true
        clearTimeout(qrTimeout)
        reject(error)
      }

      // Safety net: reject if QR not generated within 60 seconds
      const qrTimeout = setTimeout(() => {
        fail(new Error('QR generation timed out. Please try again.'))
      }, 60000)

      this.socket?.ev.on('connection.update', (update) => {
        this.connectionState = update
        const { connection } = update

        if (connection === 'open') {
          emitEvent('connection.update', this.clientId, { status: WAStatus.Connected, insert })
          this.updateWaConnection(update.isNewLogin === true ? WAStatus.Authenticated : WAStatus.Connected)
          this.retries = 0
          callback()
          done(undefined)
          return
        }

        if (connection === 'close') {
          this.handleConnectionClose(createdBy, insert, callback).catch(() => console.log('Error on handle connextion'))
          // For new session creation, fail immediately on close so user can retry
          if (insert === true) {
            fail(new Error('WhatsApp connection closed. Please try again.'))
          }
          return
        }

        if (connection === 'connecting') {
          this.updateWaConnection(WAStatus.PullingWAData)
          return
        }

        // connection is undefined — check for QR or other data
        this.handleConnectionUpdate().then((qr) => {
          if (qr !== undefined) done(qr)
        }).catch(fail)
      })
    })

    const qr = await qrPromise.catch((error) => {
      throw new Error(error)
    })

    return qr
  }

  shouldReconnect (): boolean {
    let attempts = this.retries ?? 0

    if (attempts < 5) {
      attempts += 1
      this.retries = attempts
      return true
    }
    return false
  }

  async ensureConnected (createdBy?: string): Promise<void> {
    const isSocketOpen = this.session?.ws.isOpen
    if (isSocketOpen === false) {
      await this.addSession('')

      try {
        await this.session?.waitForSocketOpen()
      } catch (error) {
        throw new Error('No se pudo reconectar con WhatsApp.')
      }
    }
  }

  async validJid (jid: string, type: 'group' | 'number' = 'number'): Promise<null | string> {
    try {
      if (this.session === undefined) return null

      if (type === 'number') {
        if (isLidUser(jid) === true) {
          return jid
        }
        const jids = await this.session.onWhatsApp(jid)
        if (jids === undefined) return null
        const [result] = jids
        if (result?.exists === true) {
          return result.jid
        } else {
          return null
        }
      }

      const groupMeta = await this.session.groupMetadata(jid)
      if (typeof groupMeta.id === 'string') {
        return groupMeta.id
      } else {
        return null
      }
    } catch (e) {
      return null
    }
  }

  async jidExists (jid: string, type: 'group' | 'number' = 'number'): Promise<boolean> {
    const validJid = await this.validJid(jid, type)
    return typeof validJid === 'string'
  }

  updateSyncStatus (isSynced: boolean): void {
    this.isSynced = isSynced
  }
}
export default WhatsAppService
