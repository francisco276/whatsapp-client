import { useState, useCallback, useContext } from 'react'
import { Button, Flex, Text, Loader, Tooltip } from '@vibe/core'
import { Modal, ModalContent, ModalFooter, ModalHeader } from '@vibe/core/next'
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
  const [isOpen, setIsOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null)

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
        setIsOpen(false)
        setExportResult(null)
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportResult('error')
    } finally {
      setIsExporting(false)
    }
  }, [mondayContext, fetchAllMessages, contact, chatId])

  const handleClose = useCallback(() => {
    if (isExporting) return
    setIsOpen(false)
    setExportResult(null)
  }, [isExporting])

  if (!chatId) return null

  return (
    <>
      <Tooltip content="Exportar chat">
        <Button
          kind="tertiary"
          size="small"
          onClick={() => setIsOpen(true)}
        >
          <Download />
        </Button>
      </Tooltip>

      <Modal
        id="export-chat-modal"
        show={isOpen}
        onClose={handleClose}
        size="medium"
      >
        <ModalHeader title="Exportar conversación" />
        <ModalContent>
          <Flex direction="column" gap={16} className="p-2">
            {isExporting ? (
              <Flex direction="column" align="center" gap={12} className="py-4">
                <Loader size={32} />
                <Text type="text2" color="secondary">
                  Exportando conversación...
                </Text>
              </Flex>
            ) : exportResult === 'success' ? (
              <Text type="text2" style={{ color: '#258750' }}>
                Chat exportado correctamente. Revisa la pestaña de "Actualizaciones" del elemento.
              </Text>
            ) : exportResult === 'error' ? (
              <Text type="text2" style={{ color: '#d83a52' }}>
                Error al exportar. Intenta de nuevo.
              </Text>
            ) : (
              <Text type="text2" color="secondary">
                El historial completo del chat se publicará como una actualización en el elemento actual de Monday.com.
              </Text>
            )}
          </Flex>
        </ModalContent>
        {!isExporting && exportResult !== 'success' && (
          <ModalFooter
            primaryButton={{
              text: 'Exportar',
              onClick: handleExport,
              disabled: isExporting,
            }}
            secondaryButton={{
              text: 'Cancelar',
              onClick: handleClose,
            }}
          />
        )}
      </Modal>
    </>
  )
}
