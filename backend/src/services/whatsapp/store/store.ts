import type { BaileysEventEmitter } from 'baileys'
import * as handlers from './handlers'

export class Store {
  private readonly chatHandler
  private readonly contactHandler
  private readonly messagesHandler
  private readonly sessionHanlder

  constructor (sessionId: string, workspaceId: string, event: BaileysEventEmitter) {
    this.chatHandler = handlers.chatHandler(sessionId, workspaceId, event)
    this.contactHandler = handlers.contactHanlder(sessionId, workspaceId, event)
    this.messagesHandler = handlers.messagesHandler(sessionId, workspaceId, event)
    this.sessionHanlder = handlers.sessionSyncHandler(sessionId, workspaceId, event)
    this.listen()
  }

  public listen (): void {
    this.chatHandler.listen()
    this.contactHandler.listen()
    this.messagesHandler.listen()
    this.sessionHanlder.listen()
  }

  public unlisten (): void {
    this.chatHandler.unlisten()
    this.contactHandler.unlisten()
    this.messagesHandler.unlisten()
    this.sessionHanlder.listen()
  }
}
