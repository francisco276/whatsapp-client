type MessageKey = {
  id: string
  fromMe: boolean
  remoteJid: string
  participant: string
}

export type WMessage = {
  conversation?: string
  extendedTextMessage?: {
    text: string,
    contextInfo: {
      isForwarded: boolean
      forwardingScore: number
    }
  },
  stickerMessage?: {
    url: string,
    contextInfo: {
      isForwarded: boolean
      forwardingScore: number
    }
  },
  imageMessage?: {
    url: string
    caption: string,
    contextInfo: {
      isForwarded: boolean
      forwardingScore: number
    }
  },
  videoMessage?: {
    url: string
    gifPlayback: boolean
    caption: string,
    contextInfo: {
      isForwarded: boolean
      forwardingScore: number
    }
  },
  documentMessage: {
    url: string
    mimetype: string
    caption?: string
    title: string,
    fileName: string
    contextInfo: {
      isForwarded: boolean
      forwardingScore: number
    }
  },
  documentWithCaptionMessage: {
    message: {
      documentMessage: {
        url: string
        mimetype: string
        caption?: string
        title: string,
        fileName: string,
        contextInfo: {
          isForwarded: boolean
          forwardingScore: number
        }
      }
    }
  }
  interactiveMessage?: {
    body: {
      text: string
    },
    header: {
      hasMediaAttachment: boolean
      imageMessage: {
        url: string
      }
    }
  },
  templateMessage?: {
    interactiveMessageTemplate: {
      body: {
        text: string
      },
      header: {
        hasMediaAttachment: boolean
        imageMessage: {
          url: string
        }
      }
    },
    hydratedFourRowTemplate: {
      hydratedContentText: string
      imageMessage: {
        url: string
      }
    }
  },
  editedMessage: {
    message: {
      protocolMessage: {
        editedMessage: {
          conversation: string
        }
      }
    }
  }
}

export type Message = {
  pkId: number
  sessionId: string
  workspaceId: string
  remoteJid: string
  id: string
  broadcast: boolean
  key: MessageKey
  message: WMessage
  messageTimestamp: number
  pushName: string
  status: number
}

export type MessageList = {
  data: Message[]
  cursor: number | string
  offset: number | string
}

export type MessageContent = {
  text: string
  url?: string
  isImage: boolean
  isVideo: boolean
  isDocument: boolean
  isSticker: boolean
  type?: string
  documentTitle?: string
  isForwarded: boolean
  isGift?: boolean
}

export type MessageItem = {
  id: string
  isAGroup: boolean,
  isMyMessage: boolean
  timestamp: Date,
  message: MessageContent,
  originalMessage?: Message,
  participant: string,
  workspaceId: string,
  sessionId: string
  pushName: string
  isDateSeprator?: boolean
}
