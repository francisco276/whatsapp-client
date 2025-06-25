import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListItem, ListItemAvatar, Label, Text } from '@vibe/core'
import { updateAuthorizationUser } from '@/lib/services/authorization'
import { AuthorizedUser } from '@/types'

type UserItemProps = {
  user: AuthorizedUser
}

export const UserItem = ({ user }: UserItemProps) => {
  const queryClient = useQueryClient()
  const { mutate } = useMutation({
    mutationFn: updateAuthorizationUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizeUsers'] })
    }
  })

  function handleUpdate() {
    const payload = {
      workspaceId: user.workspaceId,
      userId: user.id,
      ...(user.authorized ? { deleted: true } : {})
    }
    mutate(payload)
  }
  return (
    <ListItem size="large" className="!px-0" component="div" onClick={handleUpdate}>
      <ListItemAvatar src={user.image} />
      <Text ellipsis>{user.name}</Text>
      <Label className="ml-auto" text="Autorizado" color="positive" labelClassName={!user.authorized ? "!bg-neutral-300" : ""} />
    </ListItem>
  )
}
