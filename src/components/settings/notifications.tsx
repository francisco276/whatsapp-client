import { Flex, Toggle, Text, useSwitch } from "@vibe/core"
import { SettingBox } from "./setting-box"
import { usePreferences } from "@/hooks/usePreferences"
import { useContext } from '@/hooks/useContext.ts'
import { MondayApi } from '@/lib/monday/api'

export const Notifications = () => {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { userId } = context
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
