import { DeleteSessionList } from '../sessions/delete-session-list'
import { SettingBox } from './setting-box'

export const RemoveSession = () => {
  return (
    <SettingBox title='Sesiones'>
      <DeleteSessionList />
    </SettingBox>
  )
}
