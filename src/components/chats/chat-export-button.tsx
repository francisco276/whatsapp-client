import { useState, useCallback, useContext, useRef, useEffect } from 'react'
import { Button, Flex, Text, Loader, Tooltip, Dialog, DialogContentContainer, Dropdown } from '@vibe/core'
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
import type { BoardColumn } from '@/types/monday'

const monday = new MondayApi()

type ColumnOption = { value: string; label: string }

export const ChatExportButton = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null)
  const [textColumns, setTextColumns] = useState<ColumnOption[]>([])
  const [selectedColumn, setSelectedColumn] = useState<ColumnOption | null>(null)
  const [loadingColumns, setLoadingColumns] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLDivElement>(null)

  const chatId = useChatId()
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId })
  const { data: mondayContext } = useMondayContext()

  useEffect(() => {
    if (!isOpen || !mondayContext?.boardId) return

    const loadColumns = async () => {
      setLoadingColumns(true)
      try {
        const res = await monday.query.getBoardColumns(String(mondayContext.boardId))
        const boards = res?.data?.boards
        if (boards?.[0]?.columns) {
          const txtCols = boards[0].columns
            .filter((c: BoardColumn) => c.type === 'text')
            .map((c: BoardColumn) => ({ value: c.id, label: c.title }))
          setTextColumns(txtCols)
          if (txtCols.length > 0) {
            setSelectedColumn(txtCols[0])
          }
        }
      } catch (err) {
        console.error('Failed to load columns:', err)
      } finally {
        setLoadingColumns(false)
      }
    }

    loadColumns()
  }, [isOpen, mondayContext?.boardId])

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
    if (!mondayContext?.itemId || !mondayContext?.boardId) return

    setIsExporting(true)
    setExportResult(null)

    try {
      const messages = await fetchAllMessages()
      const contactName = contact?.displayName || chatId || 'Contacto'
      const formattedText = formatChatForExport(messages, contactName)

      const promises: Promise<any>[] = [
        monday.mutation.createUpdate(mondayContext.itemId, formattedText)
      ]

      if (selectedColumn) {
        promises.push(
          monday.mutation.changeColumnValue(
            String(mondayContext.boardId),
            String(mondayContext.itemId),
            selectedColumn.value,
            JSON.stringify(formattedText)
          )
        )
      }

      await Promise.all(promises)

      setExportResult('success')
      setTimeout(() => {
        setExportResult(null)
        setIsOpen(false)
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
  }, [mondayContext, fetchAllMessages, contact, chatId, selectedColumn])

  if (!chatId) return null

  const dialogContent = (
    <DialogContentContainer style={{ padding: 16, width: 300 }}>
      <Flex direction="column" gap={12}>
        {isExporting ? (
          <Flex direction="column" align="center" gap={8} className="py-2">
            <Loader size={24} />
            <Text type="text2" color="secondary">Exportando...</Text>
          </Flex>
        ) : exportResult === 'success' ? (
          <Text type="text2" style={{ color: '#258750' }}>
            Exportado correctamente.
          </Text>
        ) : exportResult === 'error' ? (
          <Text type="text2" style={{ color: '#d83a52' }}>
            Error al exportar. Intenta de nuevo.
          </Text>
        ) : (
          <>
            <Text type="text2" color="secondary">
              Se publicará como actualización y en la columna de texto seleccionada.
            </Text>
            {loadingColumns ? (
              <Flex align="center" gap={8}>
                <Loader size={16} />
                <Text type="text2" color="secondary">Cargando columnas...</Text>
              </Flex>
            ) : textColumns.length > 0 ? (
              <Dropdown
                size="small"
                placeholder="Columna de texto"
                options={textColumns}
                value={selectedColumn}
                onChange={(option: ColumnOption | null) => setSelectedColumn(option)}
                menuPosition="fixed"
              />
            ) : (
              <Text type="text2" color="secondary" style={{ fontStyle: 'italic' }}>
                No hay columnas de tipo Texto en el tablero.
              </Text>
            )}
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
  )

  return (
    <div ref={buttonRef}>
      <Dialog
        position="bottom"
        showTrigger={['click']}
        hideTrigger={['clickoutside']}
        content={dialogContent}
        onDialogDidShow={() => setIsOpen(true)}
        onDialogDidHide={() => {
          setIsOpen(false)
          setExportResult(null)
        }}
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
