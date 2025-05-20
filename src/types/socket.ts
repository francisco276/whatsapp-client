export type EventsType =
  | 'qrcode.updated'
  | 'connection.update'
  | 'messaging-history.set'
  | 'messages.upsert'
  | 'messages.update'
  | 'messages.delete'
  | 'message-receipt.update'
  | 'messages.reaction'
  | 'send.message'
  | 'contacts.set'
  | 'contacts.upsert'
  | 'contacts.update'
  | 'presence.update'
  | 'chats.set'
  | 'chats.update'
  | 'chats.upsert'
  | 'chats.delete'
  | 'groups.upsert'
  | 'groups.update'
  | 'group-participants.update'
  | 'call.upsert'


export type QrUpdateData = {
  qr: string
}

export type SessionAddedData = {
  insert?: boolean,
}

type EventData = QrUpdateData | SessionAddedData

type SocketStatus =
  'success' |
  'error'

type SocketResponse = {
  clientId: string
  event: EventsType
}

export type SocketSuccessResponse = SocketResponse & {
  data: {
    data: EventData
    status: SocketStatus
  }

}

export type SocketErrorResponse = SocketResponse & {
  data: {
    message: string
    status: SocketStatus
  }
}
