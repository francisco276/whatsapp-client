import { useState, useCallback, useContext, useEffect, useRef } from 'react'
import { Button, Loader } from '@vibe/core'
import { getChats, type Chat } from '@/lib/services/chats'
import { api } from '@/lib/axios'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { SessionContext } from '@/components/providers/session/session-context'
import { MondayApi } from '@/lib/monday/api'

interface AttachedFile {
  name: string
  mimetype: string
  dataUri: string
  size: number
}

interface BulkResult {
  jid: string
  name: string
  success: boolean
  error?: string
}

interface Props {
  onClose: () => void
}

interface BoardContact {
  itemId: string
  name: string
  phone: string
  jid: string
}

type Tab = 'whatsapp' | 'board'

function isGroup(jid: string) {
  return jid.endsWith('@g.us')
}

function formatPhone(jid: string) {
  const raw = jid.split('@')[0]
  return raw.startsWith('+') ? raw : `+${raw}`
}

function phoneToJid(phone: string): string | null {
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 7) return null
  return `${digits}@s.whatsapp.net`
}

function readFileAsDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function buildWhatsAppMessage(text: string, attachment: AttachedFile | null): any {
  if (!attachment) return { text }

  const base = {
    caption: text,
    mimetype: attachment.mimetype,
    fileName: attachment.name,
  }

  if (attachment.mimetype.startsWith('image/')) {
    return { image: { url: attachment.dataUri }, ...base }
  }
  if (attachment.mimetype.startsWith('video/')) {
    return { video: { url: attachment.dataUri }, ...base }
  }
  if (attachment.mimetype.startsWith('audio/')) {
    return { audio: { url: attachment.dataUri }, mimetype: attachment.mimetype, ptt: false }
  }
  return { document: { url: attachment.dataUri }, ...base }
}

const monday = new MondayApi()

export const BulkMessageModal = ({ onClose }: Props) => {
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)

  const [tab, setTab] = useState<Tab>('whatsapp')

  const [chats, setChats] = useState<Chat[]>([])
  const [loadingChats, setLoadingChats] = useState(false)

  const [boardContacts, setBoardContacts] = useState<BoardContact[]>([])
  const [phoneColumns, setPhoneColumns] = useState<{ id: string; title: string }[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [loadingBoard, setLoadingBoard] = useState(false)
  const [boardError, setBoardError] = useState<string | null>(null)
  const boardIdRef = useRef<string | null>(null)

  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [attachment, setAttachment] = useState<AttachedFile | null>(null)
  const [delay, setDelay] = useState(3)
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState<BulkResult[]>([])
  const [done, setDone] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const dataUri = await readFileAsDataUri(file)
    setAttachment({ name: file.name, mimetype: file.type, dataUri, size: file.size })
    e.target.value = ''
  }, [])

  useEffect(() => {
    if (!workspaceId || !session) return
    setLoadingChats(true)
    getChats({ workspaceId, sessionId: session })
      .then((data) => {
        const filtered = (data.chats || []).filter((c) => !isGroup(c.id))
        setChats(filtered)
      })
      .finally(() => setLoadingChats(false))
  }, [workspaceId, session])

  useEffect(() => {
    if (tab !== 'board') return
    setLoadingBoard(true)
    setBoardError(null)
    monday.getContext().then(async (ctx: any) => {
      const boardId = ctx?.data?.boardId
      if (!boardId) {
        setBoardError('No se encontró el tablero actual')
        setLoadingBoard(false)
        return
      }
      boardIdRef.current = String(boardId)

      try {
        const { data } = await monday.query.getBoardColumns(String(boardId))
        const cols = data?.boards?.[0]?.columns ?? []
        const phoneCols = cols.filter((c: any) => c.type === 'phone')
        if (phoneCols.length === 0) {
          setBoardError('No se encontraron columnas de tipo teléfono en este tablero')
          setLoadingBoard(false)
          return
        }
        setPhoneColumns(phoneCols)
        setSelectedColumn(phoneCols[0].id)
      } catch {
        setBoardError('Error al cargar las columnas del tablero')
      }
      setLoadingBoard(false)
    })
  }, [tab])

  useEffect(() => {
    if (!selectedColumn || !boardIdRef.current) return
    setLoadingBoard(true)
    setBoardContacts([])
    monday.query.getBoardItemsWithPhoneColumn(boardIdRef.current, selectedColumn)
      .then(({ data }) => {
        const items = data?.boards?.[0]?.items_page?.items ?? []
        const contacts: BoardContact[] = []
        for (const item of items) {
          const cv = item.column_values?.[0]
          const phone = cv?.phone || cv?.text || ''
          if (!phone) continue
          const jid = phoneToJid(phone)
          if (!jid) continue
          contacts.push({ itemId: String(item.id), name: item.name, phone, jid })
        }
        setBoardContacts(contacts)
      })
      .catch(() => setBoardError('Error al cargar los elementos del tablero'))
      .finally(() => setLoadingBoard(false))
  }, [selectedColumn])

  const currentList: { id: string; name: string; subtitle: string }[] = tab === 'whatsapp'
    ? chats.map((c) => ({ id: c.id, name: c.name || formatPhone(c.id), subtitle: formatPhone(c.id) }))
    : boardContacts.map((b) => ({ id: b.jid, name: b.name, subtitle: b.phone }))

  const filtered = currentList.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.subtitle.includes(search)
  )

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (selected.size === filtered.length && filtered.length > 0) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }, [filtered, selected.size])

  const handleSend = useCallback(async () => {
    if (!workspaceId || !session || (!message.trim() && !attachment) || selected.size === 0) return

    setIsSending(true)
    setDone(false)

    const jids = Array.from(selected)
    const results: BulkResult[] = []
    const whatsappMessage = buildWhatsAppMessage(message, attachment)

    for (let i = 0; i < jids.length; i++) {
      const jid = jids[i]
      const contact = currentList.find((c) => c.id === jid)
      const name = contact?.name || formatPhone(jid)

      try {
        const payload = [{
          jid,
          type: isGroup(jid) ? 'group' : 'number',
          message: whatsappMessage,
          delay: i === 0 ? 0 : delay * 1000,
          options: {}
        }]

        await api.post(`${workspaceId}/${session}/messages/send/bulk`, payload, { timeout: 0 })
        results.push({ jid, name, success: true })
      } catch {
        results.push({ jid, name, success: false, error: 'Error al enviar' })
      }

      setProgress([...results])
    }

    setDone(true)
    setIsSending(false)
  }, [workspaceId, session, message, attachment, selected, currentList, delay])

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab)
    setSelected(new Set())
    setSearch('')
  }

  const succeeded = progress.filter((r) => r.success).length
  const failed = progress.filter((r) => !r.success).length

  const tabStyle = (t: Tab): React.CSSProperties => ({
    padding: '8px 16px',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    borderBottom: tab === t ? '2px solid #0073ea' : '2px solid transparent',
    background: 'none',
    color: tab === t ? '#0073ea' : '#676879',
    transition: 'color 0.15s',
  })

  return (
    <div
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100%', height: '100%',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSending) onClose()
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: 8,
        width: 520,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '16px 20px 0', borderBottom: '1px solid #e6e9ef' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: 700, fontSize: 16, color: '#323338' }}>
            Mensajes masivos
          </p>
          <div style={{ display: 'flex', gap: 0 }}>
            <button style={tabStyle('whatsapp')} onClick={() => handleTabChange('whatsapp')}>
              Desde WhatsApp
            </button>
            <button style={tabStyle('board')} onClick={() => handleTabChange('board')}>
              Desde tablero
            </button>
          </div>
        </div>

        {done ? (
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            <p style={{ margin: '0 0 12px 0', fontWeight: 600, fontSize: 14, color: '#323338' }}>
              Resultado: {succeeded} enviados, {failed} fallidos
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {progress.map((r) => (
                <div key={r.jid} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: r.success ? '#f0faf4' : '#fff5f5',
                  border: `1px solid ${r.success ? '#b7e4c7' : '#f5c6cb'}`
                }}>
                  <span style={{ fontSize: 14 }}>{r.success ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 13, color: '#323338', flex: 1 }}>{r.name}</span>
                  {r.error && <span style={{ fontSize: 12, color: '#d83a52' }}>{r.error}</span>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button size="small" onClick={onClose}>Cerrar</Button>
            </div>
          </div>
        ) : isSending ? (
          <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Loader size={20} />
              <p style={{ margin: 0, fontSize: 14, color: '#676879' }}>
                Enviando {progress.length} de {selected.size}...
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {progress.map((r) => (
                <div key={r.jid} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 10px',
                  borderRadius: 4,
                  backgroundColor: r.success ? '#f0faf4' : '#fff5f5',
                  border: `1px solid ${r.success ? '#b7e4c7' : '#f5c6cb'}`
                }}>
                  <span style={{ fontSize: 14 }}>{r.success ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 13, color: '#323338' }}>{r.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #e6e9ef' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: 13, fontWeight: 600, color: '#323338' }}>
                Mensaje
              </p>
              <textarea
                placeholder={attachment ? 'Escribe un pie de foto (opcional)...' : 'Escribe el mensaje a enviar...'}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 4,
                  border: '1px solid #c5c7d0',
                  fontSize: 14,
                  color: '#323338',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
              />

              <div style={{ marginTop: 8 }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.txt"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                {attachment ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 4,
                    border: '1px solid #c5c7d0',
                    backgroundColor: '#f8f9fb',
                  }}>
                    <span style={{ fontSize: 18 }}>
                      {attachment.mimetype.startsWith('image/') ? '🖼️'
                        : attachment.mimetype.startsWith('video/') ? '🎬'
                        : attachment.mimetype.startsWith('audio/') ? '🎵'
                        : '📄'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: '#323338', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment.name}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#9699a6' }}>
                        {formatFileSize(attachment.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => setAttachment(null)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 16, color: '#9699a6', padding: '0 4px', lineHeight: 1,
                      }}
                      title="Quitar archivo"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 4,
                      border: '1px dashed #c5c7d0',
                      background: 'none',
                      cursor: 'pointer',
                      fontSize: 12,
                      color: '#676879',
                      width: '100%',
                      justifyContent: 'center',
                    }}
                  >
                    📎 Adjuntar imagen, video o archivo
                  </button>
                )}
              </div>

              <div style={{ marginTop: 10 }}>
                <p style={{ margin: '0 0 4px 0', fontSize: 13, color: '#676879' }}>
                  Intervalo entre mensajes: <strong>{delay}s</strong>
                </p>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={delay}
                  onChange={(e) => setDelay(Number(e.target.value))}
                  style={{ width: '100%', cursor: 'pointer' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#676879' }}>1s</span>
                  <span style={{ fontSize: 11, color: '#676879' }}>30s</span>
                </div>
              </div>
            </div>

            <div style={{ padding: '12px 20px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {tab === 'board' && phoneColumns.length > 1 && (
                <div style={{ marginBottom: 10 }}>
                  <p style={{ margin: '0 0 4px 0', fontSize: 12, color: '#676879' }}>Columna de teléfono:</p>
                  <select
                    value={selectedColumn}
                    onChange={(e) => { setSelectedColumn(e.target.value); setSelected(new Set()) }}
                    style={{
                      width: '100%',
                      padding: '6px 10px',
                      borderRadius: 4,
                      border: '1px solid #c5c7d0',
                      fontSize: 13,
                      color: '#323338',
                      outline: 'none',
                    }}
                  >
                    {phoneColumns.map((col) => (
                      <option key={col.id} value={col.id}>{col.title}</option>
                    ))}
                  </select>
                </div>
              )}

              {boardError ? (
                <p style={{ margin: 0, fontSize: 13, color: '#d83a52', padding: '12px 0' }}>
                  {boardError}
                </p>
              ) : loadingBoard ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                  <Loader size={20} />
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#323338' }}>
                      Contactos ({selected.size} seleccionados)
                    </p>
                    <button
                      onClick={toggleAll}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        fontSize: 12, color: '#0073ea', padding: '2px 6px',
                      }}
                    >
                      {selected.size === filtered.length && filtered.length > 0 ? 'Deseleccionar todos' : 'Seleccionar todos'}
                    </button>
                  </div>

                  <input
                    placeholder="Buscar contacto..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '7px 10px',
                      borderRadius: 4,
                      border: '1px solid #c5c7d0',
                      fontSize: 13,
                      color: '#323338',
                      outline: 'none',
                      marginBottom: 8,
                      boxSizing: 'border-box',
                    }}
                  />

                  <div style={{ flex: 1, overflowY: 'auto', maxHeight: 200, border: '1px solid #e6e9ef', borderRadius: 4 }}>
                    {(tab === 'whatsapp' ? loadingChats : loadingBoard) ? (
                      <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                        <Loader size={20} />
                      </div>
                    ) : filtered.length === 0 ? (
                      <p style={{ margin: 0, padding: 16, fontSize: 13, color: '#676879', textAlign: 'center' }}>
                        No se encontraron contactos
                      </p>
                    ) : (
                      filtered.map((contact) => (
                        <div
                          key={contact.id}
                          onClick={() => toggleSelect(contact.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '8px 12px',
                            cursor: 'pointer',
                            backgroundColor: selected.has(contact.id) ? '#e6f4ff' : 'transparent',
                            borderBottom: '1px solid #f5f6f8',
                            transition: 'background 0.1s',
                          }}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={selected.has(contact.id)}
                            style={{ cursor: 'pointer', width: 14, height: 14 }}
                          />
                          <span style={{ fontSize: 13, color: '#323338', flex: 1 }}>
                            {contact.name}
                          </span>
                          <span style={{ fontSize: 11, color: '#9699a6' }}>
                            {contact.subtitle}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </>
              )}
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e6e9ef', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button kind="tertiary" size="small" onClick={onClose}>Cancelar</Button>
              <Button
                size="small"
                onClick={handleSend}
                disabled={selected.size === 0 || (!message.trim() && !attachment)}
              >
                Enviar a {selected.size} contacto{selected.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
