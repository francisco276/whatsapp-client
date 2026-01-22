import { useMemo, useState } from 'react'
import { Flex, Search, Dropdown } from '@vibe/core'
import { SettingBox } from "./setting-box"
import { AUTHORIZATION_TYPES } from '@/config/constants'
import { useAuthorizeUsers } from '@/hooks/useAuthorizeUsers'
import { UserList } from '../user/user-list'

type Filter = {
  authorized: { value: keyof typeof AUTHORIZATION_TYPES, label: string },
  search: string
}

export const Authorization = () => {
  const [filters, setFilters] = useState<Filter>({
    authorized: { label: AUTHORIZATION_TYPES.All, value: 'All' },
    search: ''
  })
  const options = useMemo(() => Object.entries(AUTHORIZATION_TYPES).map(([key, value]) => ({ label: value, value: key })), [])
  const { users, isLoading } = useAuthorizeUsers(filters)

  function handlerFilterSearch(value: string) {
    setFilters(prev => ({ ...prev, search: value }))
  }

  function handlerFilterAuthorized(value: { value: keyof typeof AUTHORIZATION_TYPES, label: string }) {
    setFilters(prev => ({ ...prev, authorized: value }))
  }

  return (
    <SettingBox title="Autorizacion">
      <Flex justify='space-between' className='mb-5' gap={15}>
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
      <UserList users={users} loading={isLoading} />
    </SettingBox>
  )
}
