import { useState, useCallback, useContext, useEffect } from 'react'
import { Button, Loader } from '@vibe/core'
import { getChats, type Chat } from '@/lib/services/chats'
import { api } from '@/lib/axios'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { SessionContext } from '@/components/providers/session/session-context'

interface BulkResult {
  jid: string
  name: string
  success: boolean
  error?: string
}

interface Props {
  onClose: () => void
}

function isGroup(jid: string) {
  return jid.endsWith('@g.us')
}

function formatPhone(jid: string) {
  const raw = jid.split('@')[0]
  return raw.startsWith('+') ? raw : `+${raw}`
}


export const BulkMessageModal = ({ onClose }: Props) => {
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)

  const [chats, setChats] = useState<Chat[]>([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [message, setMessage] = useState('')
  const [delay, setDelay] = useState(3)
  const [isSending, setIsSending] = useState(false)
  const [progress, setProgress] = useState<BulkResult[]>([])
  const [done, setDone] = useState(false)

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

  const filtered = chats.filter((c) => {
    const name = c.name || formatPhone(c.id)
    return name.toLowerCase().includes(search.toLowerCase()) || c.id.includes(search)
  })

  const toggleSelect = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((c) => c.id)))
    }
  }, [filtered, selected.size])

  const handleSend = useCallback(async () => {
    if (!workspaceId || !session || !message.trim() || selected.size === 0) return

    setIsSending(true)
    setDone(false)

    const jids = Array.from(selected)
    const results: BulkResult[] = []

    for (let i = 0; i < jids.length; i++) {
      const jid = jids[i]
      const chat = chats.find((c) => c.id === jid)
      const name = chat?.name || formatPhone(jid)

      try {
        const payload = [{
          jid,
          type: isGroup(jid) ? 'group' : 'number',
          message: { text: message },
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
  }, [workspaceId, session, message, selected, chats, delay])

  const succeeded = progress.filter((r) => r.success).length
  const failed = progress.filter((r) => !r.success).length

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
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e6e9ef' }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: '#323338' }}>
            Mensajes masivos
          </p>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#676879' }}>
            Envía un mensaje a múltiples contactos
          </p>
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
                placeholder="Escribe el mensaje a enviar..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
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
                {loadingChats ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                    <Loader size={20} />
                  </div>
                ) : filtered.length === 0 ? (
                  <p style={{ margin: 0, padding: 16, fontSize: 13, color: '#676879', textAlign: 'center' }}>
                    No se encontraron contactos
                  </p>
                ) : (
                  filtered.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => toggleSelect(chat.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '8px 12px',
                        cursor: 'pointer',
                        backgroundColor: selected.has(chat.id) ? '#e6f4ff' : 'transparent',
                        borderBottom: '1px solid #f5f6f8',
                        transition: 'background 0.1s',
                      }}
                    >
                      <input
                        type="checkbox"
                        readOnly
                        checked={selected.has(chat.id)}
                        style={{ cursor: 'pointer', width: 14, height: 14 }}
                      />
                      <span style={{ fontSize: 13, color: '#323338', flex: 1 }}>
                        {chat.name || formatPhone(chat.id)}
                      </span>
                      <span style={{ fontSize: 11, color: '#9699a6' }}>
                        {formatPhone(chat.id)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ padding: '12px 20px', borderTop: '1px solid #e6e9ef', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Button kind="tertiary" size="small" onClick={onClose}>Cancelar</Button>
              <Button
                size="small"
                onClick={handleSend}
                disabled={selected.size === 0 || !message.trim()}
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
