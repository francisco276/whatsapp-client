import { useState, useCallback, useContext, useRef } from 'react'
import { Button, Flex, Text, Loader, Tooltip, Dialog, DialogContentContainer } from '@vibe/core'
import { Download } from '@vibe/icons'
import { MondayApi } from '@/lib/monday/api'
import { useContext as useMondayContext } from '@/hooks/useContext'
import { getMessages } from '@/lib/services/messages'
import { formatChatForExport } from '@/utils/export-chat'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { SessionContext } from '@/components/providers/session/session-context'
import type { Message } from '@/types/message'

const monday = new MondayApi()

export const ChatExportButton = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  const chatId = useChatId()
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId })
  const { data: mondayContext } = useMondayContext()

  const fetchAllMessages = useCallback(async (): Promise<Message[]> => {
    if (!workspaceId || !session || !chatId) return []

    const allMessages: Message[] = []
    let offset: number | string | undefined = undefined

    while (true) {
      const page = await getMessages({
        workspaceId,
        sessionId: session,
        chatId,
        offset
      })

      allMessages.push(...page.data)

      if (!page.offset) break
      offset = page.offset
    }

    return allMessages
  }, [workspaceId, session, chatId])

  const handleExport = useCallback(async () => {
    if (!mondayContext?.itemId) return

    setIsExporting(true)
    setExportResult(null)

    try {
      const messages = await fetchAllMessages()
      const contactName = contact?.displayName || chatId || 'Contacto'
      const formattedText = formatChatForExport(messages, contactName)

      await monday.mutation.createUpdate(
        mondayContext.itemId,
        formattedText
      )

      setExportResult('success')
      setTimeout(() => {
        setExportResult(null)
      }, 3000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportResult('error')
      setTimeout(() => {
        setExportResult(null)
      }, 3000)
    } finally {
      setIsExporting(false)
    }
  }, [mondayContext, fetchAllMessages, contact, chatId])

  if (!chatId) return null

  return (
    <div ref={buttonRef}>
      <Dialog
        position="bottom"
        showTrigger={['click']}
        hideTrigger={['clickoutside']}
        content={
          <DialogContentContainer style={{ padding: 16, maxWidth: 280 }}>
            <Flex direction="column" gap={12}>
              {isExporting ? (
                <Flex direction="column" align="center" gap={8} className="py-2">
                  <Loader size={24} />
                  <Text type="text2" color="secondary">Exportando...</Text>
                </Flex>
              ) : exportResult === 'success' ? (
                <Text type="text2" style={{ color: '#258750' }}>
                  Exportado. Revisa "Actualizaciones".
                </Text>
              ) : exportResult === 'error' ? (
                <Text type="text2" style={{ color: '#d83a52' }}>
                  Error al exportar. Intenta de nuevo.
                </Text>
              ) : (
                <>
                  <Text type="text2" color="secondary">
                    Exportar el chat como actualización en este elemento.
                  </Text>
                  <Flex gap={8} justify="end">
                    <Button
                      size="small"
                      onClick={handleExport}
                    >
                      Exportar
                    </Button>
                  </Flex>
                </>
              )}
            </Flex>
          </DialogContentContainer>
        }
      >
        <Tooltip content="Exportar chat">
          <Button
            kind="tertiary"
            size="small"
          >
            <Download />
          </Button>
        </Tooltip>
      </Dialog>
    </div>
  )
}
