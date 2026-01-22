import type { MessageItem, WMessage } from "../types/message"
export const ADITIONAL_SPACE_CHAT = 46
const ADITIONAL_SPACE_CHAT_GROUP = 66
import { isWhatsAppGroup } from '../utils/whatsapp'
import type { Message, MessageContent } from '../types/message'
import { getFormatedDateToChat } from "./time"

export const groupMessagesByDate = (messages: MessageItem[]): MessageItem[] => {
  const result: MessageItem[] = []

  let lastDate = '';

  for (const msg of messages) {
    const date = new Date(msg.timestamp)
    const dayKey = date.toDateString()

    if (dayKey !== lastDate) {

      const label = getFormatedDateToChat({ date })

      result.push({
        id: label,
        isAGroup: false,
        isMyMessage: false,
        timestamp: date,
        message: {
          text: label,
          isImage: false,
          isVideo: false,
          isDocument: false,
          isSticker: false,
          isForwarded: false
        },
        participant: '',
        workspaceId: '',
        sessionId: '',
        pushName: '',
        isDateSeprator: true
      });

      lastDate = dayKey
    }

    result.push(msg)
  }

  const lastElement = result[result.length - 1]

  if (lastElement?.isDateSeprator) {
    result.pop()
  }

  return result

}

export const mapMessageToElement = (message: Message): MessageItem => {
  const isAGroup = isWhatsAppGroup(message.key.remoteJid)
  const timestamp = new Date(message.messageTimestamp * 1000)
  const isMyMessage = message.key.fromMe

  return {
    id: message.pkId.toString(),
    isAGroup,
    isMyMessage,
    timestamp,
    message: getMessageAsString(message.message),
    originalMessage: message,
    participant: message.key.participant,
    workspaceId: message.workspaceId,
    sessionId: message.sessionId,
    pushName: message.pushName
  }
}

export const getMessageAsString = (message: WMessage): MessageContent => {
  let messageObject: MessageContent = {
    text: '',
    isImage: false,
    isVideo: false,
    isDocument: false,
    isSticker: false,
    isForwarded: false,
  }

  if (message.extendedTextMessage) {
    messageObject = {
      ...messageObject,
      text: message.extendedTextMessage.text,
      isForwarded: message.extendedTextMessage.contextInfo?.isForwarded
    }

  }

  if (message.conversation) {
    messageObject = {
      ...messageObject,
      text: message.conversation,
    }
  }

  if (message.videoMessage) {
    messageObject = {
      ...messageObject,
      url: message.videoMessage.url,
      isVideo: true,
      isGift: message.videoMessage.gifPlayback,
      isForwarded: message.videoMessage.contextInfo?.isForwarded
    }
  }

  if (message?.imageMessage) {
    messageObject = {
      ...messageObject,
      text: message.imageMessage.caption,
      url: message.imageMessage.url,
      isImage: true,
      isForwarded: message.imageMessage.contextInfo?.isForwarded
    }
  }

  if (message?.stickerMessage) {
    messageObject = {
      ...messageObject,
      url: message.stickerMessage.url,
      isSticker: true,
      isForwarded: message.stickerMessage.contextInfo?.isForwarded
    }
  }

  if (message.documentMessage || message.documentWithCaptionMessage) {
    const documentMessage = message.documentMessage || message?.documentWithCaptionMessage?.message.documentMessage

    messageObject = {
      ...messageObject,
      text: documentMessage.caption || '',
      url: documentMessage.url,
      documentTitle: documentMessage.fileName,
      type: documentMessage.mimetype.split('/')[1],
      isDocument: true,
      isForwarded: documentMessage.contextInfo?.isForwarded
    }
  }
  if (message.interactiveMessage) {
    messageObject = {
      ...messageObject,
      text: message.interactiveMessage.body.text,
      isImage: message.interactiveMessage?.header?.hasMediaAttachment || false,
      url: message.interactiveMessage?.header?.imageMessage.url || ''
    }
  }

  if (message.templateMessage) {
    if (message.templateMessage.interactiveMessageTemplate) {
      messageObject = {
        ...messageObject,
        text: message.templateMessage.interactiveMessageTemplate.body.text,
        isImage: message.templateMessage.interactiveMessageTemplate.header.hasMediaAttachment,
        url: message.templateMessage.interactiveMessageTemplate.header.imageMessage.url
      }
    }

    if (message.templateMessage.hydratedFourRowTemplate) {
      messageObject = {
        ...messageObject,
        text: message.templateMessage.hydratedFourRowTemplate.hydratedContentText,
        isImage: !!message.templateMessage.hydratedFourRowTemplate?.imageMessage?.url,
        url: message.templateMessage.hydratedFourRowTemplate?.imageMessage?.url
      }
    }
  }

  if (message.editedMessage) {
    const editedMessage = message.editedMessage

    const text = editedMessage.message.protocolMessage?.editedMessage.conversation || editedMessage.message.conversation || ''
    messageObject = {
      ...messageObject,
      text
    }
  }

  return messageObject
}

export const formatMessage = ({ message, jid }: { message: string, jid: string }): object => {
  return {
    jid,
    type: 'number',
    message: {
      text: message
    }
  }
}

export const getMessageSize = (message: MessageItem): number => {
  let aditionalSpace = (message.isAGroup && !message.isMyMessage)
    ? ADITIONAL_SPACE_CHAT_GROUP
    : ADITIONAL_SPACE_CHAT

  const charsPerLine = 51

  if (message.originalMessage) {
    const {
      text = '',
      isImage,
      isVideo,
      isDocument,
      isSticker,
      isForwarded
    } = getMessageAsString(message.originalMessage.message as WMessage)

    if (isForwarded) aditionalSpace += 24
    if (isSticker || isImage || isVideo) aditionalSpace += 200
    if (isDocument) aditionalSpace += 50

    const lineHeight = text ? 24 : 1
    const lines = text.split(/\r\n|\n|\r/)
    let totalLines = 0

    for (const line of lines) {
      const words = line.split(' ')
      let currentLineLength = 0
      let lineCount = 1

      for (const word of words) {
        const wordLength = word.length + 1 // include space
        if (currentLineLength + wordLength > charsPerLine) {
          lineCount++
          currentLineLength = wordLength
        } else {
          currentLineLength += wordLength
        }
      }

      totalLines += lineCount
    }

    return aditionalSpace + (totalLines * lineHeight)
  }

  return aditionalSpace + 8
}
