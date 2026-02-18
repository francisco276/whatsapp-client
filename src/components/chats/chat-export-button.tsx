import { useState, useCallback, useContext } from 'react'
import { Button, Flex, Text, Dropdown, Loader, Tooltip } from '@vibe/core'
import { Modal, ModalContent, ModalFooter, ModalHeader } from '@vibe/core/next'
import { Download } from '@vibe/icons'
import { useQuery } from '@tanstack/react-query'
import { MondayApi } from '@/lib/monday/api'
import { useContext as useMondayContext } from '@/hooks/useContext'
import { getMessages } from '@/lib/services/messages'
import { formatChatForExport } from '@/utils/export-chat'
import { useChatId } from '@/hooks/useChat'
import { useGetContact } from '@/hooks/useGetContact'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { SessionContext } from '@/components/providers/session/session-context'
import type { Message } from '@/types/message'
import type { BoardColumn } from '@/types/monday'

const monday = new MondayApi()

const TEXT_COLUMN_TYPES = ['long_text', 'text']

export const ChatExportButton = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedColumn, setSelectedColumn] = useState<{ value: string; label: string } | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null)

  const chatId = useChatId()
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId })
  const { data: mondayContext } = useMondayContext()

  const { data: columnsData, isLoading: isLoadingColumns } = useQuery({
    queryKey: ['boardColumns', mondayContext?.boardId],
    queryFn: async () => {
      if (!mondayContext?.boardId) return []
      const response = await monday.query.getBoardColumns(mondayContext.boardId)
      const board = response.data.boards[0]
      if (!board) return []
      return board.columns
        .filter((col: BoardColumn) => TEXT_COLUMN_TYPES.includes(col.type))
        .map((col: BoardColumn) => ({ value: col.id, label: col.title }))
    },
    enabled: !!mondayContext?.boardId && isOpen
  })

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
    if (!selectedColumn || !mondayContext?.boardId || !mondayContext?.itemId) return

    setIsExporting(true)
    setExportResult(null)

    try {
      const messages = await fetchAllMessages()
      const contactName = contact?.displayName || chatId || 'Contacto'
      const formattedText = formatChatForExport(messages, contactName)

      const value = JSON.stringify({ text: formattedText })

      await monday.mutation.changeColumnValue(
        mondayContext.boardId,
        mondayContext.itemId,
        selectedColumn.value,
        value
      )

      setExportResult('success')
      setTimeout(() => {
        setIsOpen(false)
        setExportResult(null)
        setSelectedColumn(null)
      }, 2000)
    } catch (error) {
      console.error('Export failed:', error)
      setExportResult('error')
    } finally {
      setIsExporting(false)
    }
  }, [selectedColumn, mondayContext, fetchAllMessages, contact, chatId])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setExportResult(null)
    setSelectedColumn(null)
  }, [])

  if (!chatId) return null

  return (
    <>
      <Tooltip content="Exportar chat a columna">
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
            <Text type="text2" color="secondary">
              Selecciona la columna de texto donde guardar el historial del chat.
            </Text>

            {isLoadingColumns ? (
              <Flex justify="center" className="py-4">
                <Loader size={24} />
              </Flex>
            ) : columnsData && columnsData.length > 0 ? (
              <Dropdown
                placeholder="Seleccionar columna"
                options={columnsData}
                onChange={(option: any) => setSelectedColumn(option)}
                value={selectedColumn}
                size="small"
                clearable={false}
              />
            ) : (
              <Text type="text2" color="secondary">
                No se encontraron columnas de texto en el tablero. Agrega una columna de tipo "Texto largo" o "Texto".
              </Text>
            )}

            {exportResult === 'success' && (
              <Text type="text2" style={{ color: '#258750' }}>
                Chat exportado correctamente.
              </Text>
            )}

            {exportResult === 'error' && (
              <Text type="text2" style={{ color: '#d83a52' }}>
                Error al exportar. Intenta de nuevo.
              </Text>
            )}
          </Flex>
        </ModalContent>
        <ModalFooter
          primaryButton={{
            text: isExporting ? 'Exportando...' : 'Exportar',
            onClick: handleExport,
            disabled: !selectedColumn || isExporting,
            loading: isExporting,
          }}
          secondaryButton={{
            text: 'Cancelar',
            onClick: handleClose,
            disabled: isExporting,
          }}
        />
      </Modal>
    </>
  )
}
