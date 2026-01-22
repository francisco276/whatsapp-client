import { List, Skeleton, Flex, Heading, Text } from '@vibe/core'
import { UserItem } from './user-item'
import { AuthorizedUser } from '@/types'

type UserListProps = {
  loading?: boolean
  users: AuthorizedUser[]
}

export const UserList = ({ loading = false, users }: UserListProps) => {
  if (loading) {
    return (
      <List>
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
      </List>
    )
  }

  if (users.length === 0) {
    return (
      <Flex align='center' justify='center' className='py-3' direction='column'>
        <Heading align='center' type='h3' weight='bold'>No se encontraron usuarios disponibles</Heading>
        <Text className='w-full text-wrap'>Puede que aún no se hayan agregado usuarios a esta cuenta de monday o que no tengas permisos suficientes para verlos.</Text>
        <Text>Si crees que esto es un error, contacta a un administrador.</Text>
      </Flex>
    )
  }

  return (
    <List className='min-h-[250px] max-h-[250px]'>
      {users.map((user) => <UserItem key={user.id} user={user} />)}
    </List>
  )
}
