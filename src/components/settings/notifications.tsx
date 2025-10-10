import { Flex, Toggle, Text, useSwitch } from "@vibe/core"
import { SettingBox } from "./setting-box"
import { usePreferences } from "@/hooks/usePreferences"
import { useUserId } from "@/hooks/useUserId"

export const Notifications = () => {
  const userId = useUserId()
  const { config, isLoading, mutate } = usePreferences({ userId })
  const { isChecked } = useSwitch({ defaultChecked: false, isChecked: config?.notifications?.onMessageSend })

  function handleOnChange(value: boolean) {
    mutate({ notifications: { onMessageSend: value } })
  }

  return (
    <SettingBox title="Notificaciones">
      <Flex direction="column" align="start" gap="medium">
        <Flex justify="space-between" className="w-full py-3">
          <Text>Recibe una notificación al enviar un mensaje.</Text>
          <Toggle className="ml-auto" size="small" disabled={isLoading} isSelected={isChecked} onChange={handleOnChange} />
        </Flex>
      </Flex>
    </SettingBox>
  )
}
