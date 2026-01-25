import { useState } from 'react'
import { Button, Dialog, DialogContentContainer, Flex, Text, RadioButton } from '@vibe/core'
import { Download } from '@vibe/icons'
import { useQuery } from '@tanstack/react-query'
import { getMessages } from '@/lib/services/messages'
import { Message } from '@/types/message'

interface ExportChatProps {
  workspaceId: string
  sessionId: string
  chatId: string
  contactName?: string
}

export function ExportChat({ workspaceId, sessionId, chatId, contactName }: ExportChatProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [format, setFormat] = useState<'csv' | 'txt'>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const { data } = useQuery({
    queryKey: ['messages', sessionId, chatId, workspaceId],
    queryFn: () => getMessages({ workspaceId, sessionId, chatId }),
    enabled: isOpen,
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleString('es-MX', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const exportToCSV = (messages: Message[]) => {
    const headers = ['Fecha', 'Remitente', 'Mensaje', 'Tipo']
    const rows = messages.map(msg => [
      formatDate(msg.messageTimestamp),
      msg.fromMe ? 'Yo' : (contactName || 'Contacto'),
      `"${(msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]').replace(/"/g, '""')}"`,
      msg.messageType || 'text'
    ])
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    return csvContent
  }

  const exportToTXT = (messages: Message[]) => {
    const lines = messages.map(msg => {
      const date = formatDate(msg.messageTimestamp)
      const sender = msg.fromMe ? 'Yo' : (contactName || 'Contacto')
      const content = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '[Media]'
      return `[${date}] ${sender}: ${content}`
    })
    
    return lines.join('\n')
  }

  const handleExport = () => {
    if (!data?.messages) return
    
    setIsExporting(true)
    
    const sortedMessages = [...data.messages].sort((a, b) => a.messageTimestamp - b.messageTimestamp)
    const content = format === 'csv' ? exportToCSV(sortedMessages) : exportToTXT(sortedMessages)
    const filename = `chat_${contactName || chatId}_${new Date().toISOString().split('T')[0]}.${format}`
    
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv;charset=utf-8;' : 'text/plain;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    setIsExporting(false)
    setIsOpen(false)
  }

  return (
    <>
      <Button
        size="small"
        kind="tertiary"
        leftIcon={Download}
        onClick={() => setIsOpen(true)}
      >
        Exportar
      </Button>

      <Dialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Exportar conversación"
      >
        <DialogContentContainer>
          <div className="p-4">
            <Text type="text2" className="mb-4">
              Selecciona el formato de exportación:
            </Text>
            
            <Flex direction="column" gap={12} className="mb-6">
              <RadioButton
                text="CSV (Excel, Google Sheets)"
                checked={format === 'csv'}
                onSelect={() => setFormat('csv')}
              />
              <RadioButton
                text="TXT (Texto plano)"
                checked={format === 'txt'}
                onSelect={() => setFormat('txt')}
              />
            </Flex>

            <Text type="text3" color="secondary" className="mb-4">
              Se exportarán {data?.messages?.length || 0} mensajes
            </Text>

            <Flex gap={8} justify="end">
              <Button kind="tertiary" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleExport}
                loading={isExporting}
                disabled={!data?.messages?.length}
              >
                Descargar
              </Button>
            </Flex>
          </div>
        </DialogContentContainer>
      </Dialog>
    </>
  )
}
