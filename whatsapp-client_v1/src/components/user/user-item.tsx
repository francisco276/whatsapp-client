import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ListItem, ListItemAvatar, Label, Text, Dropdown } from '@vibe/core'
import { updateAuthorizationUser } from '@/lib/services/authorization'
import { AuthorizedUser } from '@/types'
import { USER_TYPES } from '@/config/constants'
import { useMemo } from 'react'

type UserItemProps = {
  user: AuthorizedUser
}

export const UserItem = ({ user }: UserItemProps) => {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: updateAuthorizationUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['authorizeUsers'] })
    }
  })

  const options = useMemo(() => Object.entries(USER_TYPES).map(([key, value]) => ({ label: value, value: key })), [])

  function handleUpdate() {
    const payload = {
      workspaceId: user.workspaceId,
      userId: user.id,
      ...(user.authorized ? { deleted: true } : {})
    }
    mutate(payload)
  }

  function handlerRole({ value: role }: { value: keyof typeof USER_TYPES, label: string }) {
    const payload = {
      workspaceId: user.workspaceId,
      userId: user.id,
      role
    }
    mutate(payload)
  }
  return (
    <ListItem size="large" className="!px-0 overflow-visible!" component="div" >
      <ListItemAvatar src={user.image} />
      <Text className="mr-auto" ellipsis>{user.name}</Text>
      {
        user.authorized && (
          <Dropdown
            clearable={false}
            size="small"
            className='flex-1 max-w-[140px] mr-2'
            searchable={false}
            options={options}
            disabled={isPending}
            value={options.find(({ value }) => value === user.role)}
            onChange={handlerRole}
          />
        )
      }
      <Label text="Autorizado" color="positive" labelClassName={!user.authorized ? "!bg-neutral-300" : ""} onClick={handleUpdate} />
    </ListItem>
  )
}
