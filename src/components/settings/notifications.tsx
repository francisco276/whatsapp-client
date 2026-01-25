import { Flex, Toggle, Text, useSwitch } from "@vibe/core"
import { SettingBox } from "./setting-box"
import { usePreferences } from "@/hooks/usePreferences"
import { useUserId } from "@/hooks/useUserId"

export const Notifications = () => {
  const userId = useUserId()
  const { config, isLoading, mutate } = usePreferences({ userId })
  const { isChecked } = useSwitch({ defaultChecked: false, isChecked: config?.notifications?.onMessageSend })
  const { isChecked: isSoundChecked } = useSwitch({ defaultChecked: true, isChecked: config?.notifications?.soundEnabled ?? true })

  function handleOnChange(value: boolean) {
    mutate({ notifications: { onMessageSend: value, soundEnabled: config?.notifications?.soundEnabled ?? true } })
  }

  function handleSoundChange(value: boolean) {
    mutate({ notifications: { onMessageSend: config?.notifications?.onMessageSend ?? false, soundEnabled: value } })
  }

  return (
    <SettingBox title="Notificaciones">
      <Flex direction="column" align="start" gap="medium">
        <Flex justify="space-between" className="w-full py-3 border-b border-gray-100">
          <Text className="text-gray-700!">Recibe una notificación al enviar un mensaje.</Text>
          <Toggle className="ml-auto" size="small" disabled={isLoading} isSelected={isChecked} onChange={handleOnChange} />
        </Flex>
        <Flex justify="space-between" className="w-full py-3">
          <Text className="text-gray-700!">Sonido de alerta al recibir un mensaje.</Text>
          <Toggle className="ml-auto" size="small" disabled={isLoading} isSelected={isSoundChecked} onChange={handleSoundChange} />
        </Flex>
      </Flex>
    </SettingBox>
  )
}
