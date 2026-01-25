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
      <List className='min-h-[250px]'>
        <Flex align='center' gap={10} className='mb-3 p-2'>
          <Skeleton type="circle" width={40} height={40} />
          <Skeleton size="small" type="text" className="!w-[200px]" />
        </Flex>
        <Flex align='center' gap={10} className='mb-3 p-2'>
          <Skeleton type="circle" width={40} height={40} />
          <Skeleton size="small" type="text" className="!w-[180px]" />
        </Flex>
        <Flex align='center' gap={10} className='mb-3 p-2'>
          <Skeleton type="circle" width={40} height={40} />
          <Skeleton size="small" type="text" className="!w-[220px]" />
        </Flex>
      </List>
    )
  }

  if (users.length === 0) {
    return (
      <Flex align='center' justify='center' className='py-3' direction='column'>
        <Heading align='center' type='h3' weight='bold' className="text-gray-800!">No se encontraron usuarios disponibles</Heading>
        <Text className='w-full text-wrap text-gray-600!'>Puede que aún no se hayan agregado usuarios a esta cuenta de monday o que no tengas permisos suficientes para verlos.</Text>
        <Text className="text-gray-600!">Si crees que esto es un error, contacta a un administrador.</Text>
      </Flex>
    )
  }

  return (
    <List className='min-h-[250px] max-h-[250px]'>
      {users.map((user) => <UserItem key={user.id} user={user} />)}
    </List>
  )
}
