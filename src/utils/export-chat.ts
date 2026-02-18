import type { Message } from '@/types/message'
import { getMessageAsString } from './message'

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000)
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const year = date.getFullYear()
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

function getMessageText(message: Message): string {
  const content = getMessageAsString(message.message)

  const parts: string[] = []

  if (content.isImage) parts.push('[Imagen]')
  if (content.isVideo) parts.push('[Video]')
  if (content.isAudio) parts.push(`[Audio${content.audioDuration ? ` ${content.audioDuration}s` : ''}]`)
  if (content.isDocument) parts.push(`[Documento: ${content.documentTitle || 'archivo'}]`)
  if (content.isSticker) parts.push('[Sticker]')

  if (content.text) parts.push(content.text)

  return parts.join(' ') || '[Mensaje sin contenido]'
}

export function formatChatForExport(messages: Message[], contactName: string): string {
  const lines: string[] = []

  lines.push(`Conversación con ${contactName}`)
  lines.push(`Exportado: ${formatTimestamp(Date.now() / 1000)}`)
  lines.push('---')

  const sorted = [...messages].sort((a, b) => a.messageTimestamp - b.messageTimestamp)

  for (const msg of sorted) {
    const time = formatTimestamp(msg.messageTimestamp)
    const sender = msg.key.fromMe ? 'Yo' : (msg.pushName || contactName)
    const text = getMessageText(msg)
    lines.push(`[${time}] ${sender}: ${text}`)
  }

  return lines.join('\n')
}
