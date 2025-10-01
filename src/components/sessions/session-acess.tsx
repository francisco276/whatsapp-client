import { useMemo, useState } from 'react'
import { Flex, Search, Dropdown, Heading, Text } from '@vibe/core'
import { SettingBox } from "@/components/settings/setting-box"
import { AUTHORIZATION_TYPES } from '@/config/constants'
import { useSessionAccess } from '@/hooks/useSessionAccess'
import { UserAccessList } from '../user/user-access-list'
import { useSessionId } from '@/hooks/useSessionId'

type Filter = {
  authorized: { value: keyof typeof AUTHORIZATION_TYPES, label: string },
  search: string
}

export const SessionAccess = () => {
  const sessionId = useSessionId()
  const [filters, setFilters] = useState<Filter>({
    authorized: { label: AUTHORIZATION_TYPES.All, value: 'All' },
    search: ''
  })
  const options = useMemo(() => Object.entries(AUTHORIZATION_TYPES).map(([key, value]) => ({ label: value, value: key })), [])
  const { users, isLoading, mutate: useMutate } = useSessionAccess(filters)
  const { mutate } = useMutate

  function handlerFilterSearch(value: string) {
    setFilters(prev => ({ ...prev, search: value }))
  }

  function handlerFilterAuthorized(value: { value: keyof typeof AUTHORIZATION_TYPES, label: string }) {
    setFilters(prev => ({ ...prev, authorized: value }))
  }

  function hanlderClick({ userId, deleted }: { userId: string, deleted?: boolean }) {
    mutate({ userId, deleted })
  }

  return (
    <SettingBox title="Acceso a la session"> <Flex justify='space-between' className='mb-5' gap={15}>
      <Search className='flex-1 max-w-[300px]' size='small' placeholder='Search a user' onChange={handlerFilterSearch} />
      <Dropdown
        clearable={false}
        size="small"
        className='flex-1 max-w-[150px]'
        options={options}
        onChange={handlerFilterAuthorized}
        value={filters.authorized}
      />
    </Flex>
      {
        sessionId && <UserAccessList users={users} loading={isLoading} onClick={hanlderClick} />
      }
      {
        !sessionId && (
          <Flex align='center' justify='center' className='py-3' direction='column'>
            <Heading align='center' type='h3' weight='bold'>Selecciona una sesión para gestionar el acceso</Heading>
            <Text align='center' className='w-full text-wrap'>Elige la sesión en la que deseas otorgar o revocar permisos de acceso.</Text>
          </Flex>
        )
      }
    </SettingBox>
  )
}
