import { useState, useCallback, useContext, useEffect } from 'react'
import { Button, Loader, Tooltip } from '@vibe/core'
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

type ColumnOption = { id: string; title: string }

export const ChatExportButton = () => {
  const [isExporting, setIsExporting] = useState(false)
  const [exportResult, setExportResult] = useState<'success' | 'error' | null>(null)
  const [textColumns, setTextColumns] = useState<ColumnOption[]>([])
  const [selectedColumnId, setSelectedColumnId] = useState<string>('')
  const [loadingColumns, setLoadingColumns] = useState(false)
  const [showPanel, setShowPanel] = useState(false)

  const chatId = useChatId()
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const { contact } = useGetContact({ contactId: chatId, enabled: !!chatId })
  const { data: mondayContext } = useMondayContext()

  useEffect(() => {
    if (!showPanel || !mondayContext?.boardId) return

    const loadColumns = async () => {
      setLoadingColumns(true)
      try {
        const res = await monday.query.getBoardColumns(String(mondayContext.boardId))
        const boards = res?.data?.boards
        if (boards?.[0]?.columns) {
          const txtCols = boards[0].columns
            .filter((c: BoardColumn) => c.type === 'text')
            .map((c: BoardColumn) => ({ id: c.id, title: c.title }))
          setTextColumns(txtCols)
          if (txtCols.length > 0) {
            setSelectedColumnId(txtCols[0].id)
          }
        }
      } catch (err) {
        console.error('Failed to load columns:', err)
      } finally {
        setLoadingColumns(false)
      }
    }

    loadColumns()
  }, [showPanel, mondayContext?.boardId])

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

      if (selectedColumnId) {
        promises.push(
          monday.mutation.changeColumnValue(
            String(mondayContext.boardId),
            String(mondayContext.itemId),
            selectedColumnId,
            JSON.stringify(formattedText)
          )
        )
      }

      await Promise.all(promises)

      setExportResult('success')
      setTimeout(() => {
        setExportResult(null)
        setShowPanel(false)
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
  }, [mondayContext, fetchAllMessages, contact, chatId, selectedColumnId])

  if (!chatId) return null

  return (
    <>
      <Tooltip content="Exportar chat">
        <Button
          kind="tertiary"
          size="small"
          onClick={() => setShowPanel(true)}
        >
          <Download />
        </Button>
      </Tooltip>

      {showPanel && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.35)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !isExporting) {
              setShowPanel(false)
              setExportResult(null)
            }
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 8,
              padding: '20px 24px',
              margin: 16,
              width: 320,
              maxWidth: 'calc(100vw - 32px)',
              boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              boxSizing: 'border-box',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 16, color: '#323338', textAlign: 'center' }}>
                Exportar conversación
              </p>

              {isExporting ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <Loader size={24} />
                  <p style={{ margin: 0, fontSize: 14, color: '#676879' }}>Exportando...</p>
                </div>
              ) : exportResult === 'success' ? (
                <p style={{ margin: 0, fontSize: 14, color: '#258750', textAlign: 'center' }}>
                  Exportado. Revisa las actualizaciones del elemento.
                </p>
              ) : exportResult === 'error' ? (
                <p style={{ margin: 0, fontSize: 14, color: '#d83a52', textAlign: 'center' }}>
                  Error al exportar. Intenta de nuevo.
                </p>
              ) : (
                <>
                  {loadingColumns ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <Loader size={16} />
                      <p style={{ margin: 0, fontSize: 14, color: '#676879' }}>Cargando columnas...</p>
                    </div>
                  ) : textColumns.length > 0 ? (
                    <>
                      <p style={{ margin: 0, fontSize: 13, color: '#676879', lineHeight: 1.5, textAlign: 'center' }}>
                        Se publicará como actualización y se guardará en la columna seleccionada.
                      </p>
                      <div>
                        <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#676879' }}>
                          Columna de texto:
                        </p>
                        <select
                          value={selectedColumnId}
                          onChange={(e) => setSelectedColumnId(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            borderRadius: 4,
                            border: '1px solid #c5c7d0',
                            fontSize: 14,
                            color: '#323338',
                            backgroundColor: '#fff',
                            outline: 'none',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                          }}
                        >
                          {textColumns.map((col) => (
                            <option key={col.id} value={col.id}>
                              {col.title}
                            </option>
                          ))}
                        </select>
                      </div>
                    </>
                  ) : (
                    <p style={{ margin: 0, fontSize: 13, color: '#676879', lineHeight: 1.5, textAlign: 'center' }}>
                      Se publicará como actualización en el elemento actual.
                    </p>
                  )}

                  <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 4 }}>
                    <Button
                      kind="tertiary"
                      size="small"
                      onClick={() => {
                        setShowPanel(false)
                        setExportResult(null)
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      size="small"
                      onClick={handleExport}
                    >
                      Exportar
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
