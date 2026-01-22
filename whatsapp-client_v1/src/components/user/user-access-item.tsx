import { ListItem, ListItemAvatar, Label, Text } from '@vibe/core'
import { AuthorizedUser } from '@/types'

type UserAccessItemProps = {
  user: Omit<AuthorizedUser, 'role'>
  onClick: (params: { userId: string, deleted?: boolean }) => void | Promise<void>
}

export const UserAccessItem = ({ user, onClick }: UserAccessItemProps) => {
  function handleUpdate() {
    const payload = {
      userId: user.id,
      ...(user.authorized ? { deleted: true } : {})
    }
    onClick(payload)
  }

  return (
    <ListItem size="large" className="!px-0 overflow-visible!" component="div" onClick={handleUpdate}>
      <ListItemAvatar src={user.image} />
      <Text className="mr-auto" ellipsis>{user.name}</Text>
      <Label text="Autorizado" color="positive" labelClassName={!user.authorized ? "!bg-neutral-300" : ""} />
    </ListItem>
  )
}
