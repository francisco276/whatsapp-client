import { useQuery } from '@tanstack/react-query'
import { getSessions } from '@/lib/services/sessions'
import { Dropdown } from "@vibe/core"
import { useCallback, useMemo, useContext } from 'react'
import { LabelSession } from './label-session'
import { DropdownOption } from 'node_modules/@vibe/core/dist/components/Dropdown/Dropdown.types'
import { SessionContext } from '@/components/providers/session/session-context'

export const DropdownSessions = ({ workspaceId, changeSession }: { workspaceId: string, changeSession: (id: string) => void }) => {
  const { setSession } = useContext(SessionContext)
  const {
    data,
    isLoading,
  } = useQuery({
    queryKey: ['getSessions'],
    queryFn: () => getSessions({ workspaceId }),
    enabled: !!workspaceId,
  })

  const dropdownOptions = useMemo(() => data?.sessions?.map(session => ({ value: session.id })), [data])
  const labelRender = useCallback(({ value }: { value: string }) => <LabelSession workspaceId={workspaceId} sessionId={value} />, [workspaceId])

  const handlerChange = useCallback((option: DropdownOption) => {
    if (option !== undefined) {
      setSession(option.value)
      changeSession(option.value)
    }
  }, [changeSession])

  return (
    <Dropdown
      size='large'
      placeholder="Seleccione una sesion"
      options={dropdownOptions}
      cacheOptions
      defaultOptions
      autoFocus
      isLoading={isLoading}
      isVirtualized
      onChange={handlerChange}
      optionRenderer={labelRender}
      valueRenderer={labelRender}
    />
  )
}
