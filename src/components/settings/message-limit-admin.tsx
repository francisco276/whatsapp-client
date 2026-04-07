import { useState, useCallback } from 'react'
import { Button, Loader } from '@vibe/core'
import { SettingBox } from './setting-box'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { setMessageLimit } from '@/lib/services/counters'
import { useMessageCounterStore } from '@/stores/messageCounterStore'

const PACKAGES = [
  { label: 'Básico', value: 500 },
  { label: 'Estándar', value: 1000 },
  { label: 'Premium', value: 5000 },
]

export const MessageLimitAdmin = () => {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [selectedLimit, setSelectedLimit] = useState<number | null>(null)
  const [customLimit, setCustomLimit] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [result, setResult] = useState<{ success: boolean, message: string } | null>(null)

  const workspaceId = useWorkspaceId()
  const { messageLimit, applyNewLimit } = useMessageCounterStore()

  const handleUnlock = useCallback(() => {
    if (!password.trim()) {
      setPasswordError('Ingresa la contraseña')
      return
    }
    setPasswordError('')
    setIsUnlocked(true)
    setSelectedLimit(messageLimit)
  }, [password, messageLimit])

  const handleSave = useCallback(async () => {
    if (!workspaceId) return

    const limit = selectedLimit === -1 ? parseInt(customLimit) : selectedLimit
    if (!limit || limit <= 0) {
      setResult({ success: false, message: 'Ingresa un límite válido' })
      return
    }

    setIsSaving(true)
    setResult(null)

    const res = await setMessageLimit({ workspaceId, password, messageLimit: limit })

    if (res.success) {
      applyNewLimit(limit)
      setResult({ success: true, message: `Límite actualizado a ${limit.toLocaleString()} mensajes` })
      setTimeout(() => setResult(null), 4000)
    } else {
      setResult({ success: false, message: res.message || 'Error al guardar' })
      if (res.message === 'Contraseña incorrecta') {
        setIsUnlocked(false)
        setPassword('')
      }
    }

    setIsSaving(false)
  }, [workspaceId, password, selectedLimit, customLimit, applyNewLimit])

  if (!isUnlocked) {
    return (
      <SettingBox title="Administración de paquetes">
        <div style={{ marginTop: 12 }}>
          <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#676879' }}>
            Ingresa la contraseña de administrador para gestionar los paquetes de mensajes.
          </p>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setPasswordError('') }}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              style={{
                flex: 1,
                padding: '7px 10px',
                borderRadius: 4,
                border: `1px solid ${passwordError ? '#d83a52' : '#c5c7d0'}`,
                fontSize: 14,
                color: '#323338',
                outline: 'none',
              }}
            />
            <Button size="small" onClick={handleUnlock}>
              Acceder
            </Button>
          </div>
          {passwordError && (
            <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#d83a52' }}>{passwordError}</p>
          )}
        </div>
      </SettingBox>
    )
  }

  return (
    <SettingBox title="Administración de paquetes">
      <div style={{ marginTop: 12 }}>
        <p style={{ margin: '0 0 12px 0', fontSize: 13, color: '#676879' }}>
          Límite actual: <strong>{messageLimit.toLocaleString()} mensajes/mes</strong>
        </p>

        <p style={{ margin: '0 0 8px 0', fontSize: 13, color: '#676879' }}>
          Selecciona un paquete:
        </p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          {PACKAGES.map((pkg) => (
            <button
              key={pkg.value}
              onClick={() => { setSelectedLimit(pkg.value); setCustomLimit('') }}
              style={{
                padding: '8px 16px',
                borderRadius: 4,
                border: `2px solid ${selectedLimit === pkg.value ? '#0073ea' : '#c5c7d0'}`,
                backgroundColor: selectedLimit === pkg.value ? '#e6f4ff' : '#fff',
                color: selectedLimit === pkg.value ? '#0073ea' : '#323338',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {pkg.label} ({pkg.value.toLocaleString()})
            </button>
          ))}
          <button
            onClick={() => setSelectedLimit(-1)}
            style={{
              padding: '8px 16px',
              borderRadius: 4,
              border: `2px solid ${selectedLimit === -1 ? '#0073ea' : '#c5c7d0'}`,
              backgroundColor: selectedLimit === -1 ? '#e6f4ff' : '#fff',
              color: selectedLimit === -1 ? '#0073ea' : '#323338',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Personalizado
          </button>
        </div>

        {selectedLimit === -1 && (
          <div style={{ marginBottom: 12 }}>
            <input
              type="number"
              placeholder="Cantidad de mensajes"
              value={customLimit}
              onChange={(e) => setCustomLimit(e.target.value)}
              min={1}
              style={{
                width: '100%',
                padding: '7px 10px',
                borderRadius: 4,
                border: '1px solid #c5c7d0',
                fontSize: 14,
                color: '#323338',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Button size="small" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader size={16} /> : 'Guardar'}
          </Button>
          <Button size="small" kind="tertiary" onClick={() => { setIsUnlocked(false); setPassword('') }}>
            Bloquear
          </Button>
        </div>

        {result && (
          <p style={{
            margin: '8px 0 0 0',
            fontSize: 13,
            color: result.success ? '#258750' : '#d83a52',
          }}>
            {result.message}
          </p>
        )}
      </div>
    </SettingBox>
  )
}
