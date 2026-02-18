import { useState } from 'react'
import { Flex, Text, TextField, Button } from '@vibe/core'
import { SettingBox } from './setting-box'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { useUserId } from '@/hooks/useUserId'
import { useContext } from '@/hooks/useContext'
import { registerMondayTarget } from '@/lib/services/monday-register'
import { MondayApi } from '@/lib/monday/api'

export const MondayToken = () => {
  const workspaceId = useWorkspaceId()
  const userId = useUserId()
  const { data: context } = useContext()
  const [token, setToken] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const monday = new MondayApi()

  async function handleSave() {
    if (!token.trim() || !context?.boardId) return

    setSaving(true)
    try {
      await registerMondayTarget({
        workspaceId,
        userId,
        boardId: context.boardId,
        mondayToken: token.trim()
      })
      setSaved(true)
      setToken('')
      monday.successNotice('Token de Monday.com guardado correctamente')
      setTimeout(() => setSaved(false), 3000)
    } catch (e) {
      monday.errorNotice('Error al guardar el token')
    } finally {
      setSaving(false)
    }
  }

  return (
    <SettingBox title="Notificaciones del servidor">
      <Flex direction="column" align="start" gap="medium" className="mt-3">
        <Text className="text-gray-700!">
          Ingresa tu API Token de Monday.com para recibir notificaciones incluso cuando la app no esté abierta.
          Puedes obtenerlo desde tu perfil en Monday.com &gt; Developers &gt; API Token.
        </Text>
        <Flex className="w-full" gap="small">
          <TextField
            className="flex-1"
            size="small"
            placeholder="Pega tu API Token aquí"
            value={token}
            onChange={(value: string) => setToken(value)}
            type="password"
          />
          <Button
            size="small"
            onClick={handleSave}
            disabled={saving || !token.trim()}
            loading={saving}
          >
            {saved ? 'Guardado' : 'Guardar'}
          </Button>
        </Flex>
        {saved && (
          <Text className="text-green-600!">Token guardado. Las notificaciones llegarán a la campanita de Monday.com.</Text>
        )}
      </Flex>
    </SettingBox>
  )
}
