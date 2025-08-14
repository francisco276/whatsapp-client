import { ERROR_LOAD_SESSIONS } from '@/config/errors'
import { Session } from '@/types'
import { cn } from '@/utils/utils'
import { Box, Flex, Heading, IconButton } from '@vibe/core'
import { NavigationChevronLeft, NavigationChevronRight, Settings } from '@vibe/icons'
import { useCallback, useContext, useMemo, useState } from 'react'
import { MondayApi } from '../lib/monday/api'
import { AddSession } from './add-session'
import { Error } from './error'
import { SessionContext } from './providers/session/session-context'
import { SessionsList } from './sessions/sessions-list'
import { SideBarList } from './skeletons/sidebar-list'

type SessionSidebarProps = {
  type?: 'small' | 'full'
  sessions: Session[]
  loading: boolean
  error: boolean
}

const SessionSidebar = ({ sessions, loading, type = 'full', error }: SessionSidebarProps) => {
  const monday = new MondayApi()
  const { session: currentSession, setSession } = useContext(SessionContext)
  const [sessionsSidebarOpen, setSessionsSidebarOpen] = useState(true)

  const isSmallVersion = useMemo(() => type === 'small', [type])

  const isToggle = isSmallVersion ? false : sessionsSidebarOpen

  const handleOpenModal = useCallback(() => {
    monday.execute("openAppFeatureModal", { urlPath: '/config', width: 900, height: 700 })
  }, [])

  const handlerChange = useCallback((id: string) => {
    setSession(id)
  }, [])

  return (
    <Box className={cn(
      'bg-white transition-all!',
      {
        'w-[137px] min-w-[137px] max-w-[137px]': isSmallVersion,
        'w-xs! min-w-xs! max-w-xs!': !isSmallVersion && sessionsSidebarOpen,
        'w-[100px]! min-w-[100px]! max-w-[100px]!': !isSmallVersion && !sessionsSidebarOpen,
      }
    )}>
      <Flex direction='column' gap={20}>
        <Box className='w-full bg-gradient-to-r from-slate-800 to-slate-900' padding="medium">
          <Flex direction='column' align='start' gap={10}>
            {
              !isSmallVersion && <Flex gap={10} className='ml-auto transition-all duration-300'>
                <IconButton size='small' kind='tertiary' color='fixed-light' icon={Settings} onClick={handleOpenModal} />
                {!sessionsSidebarOpen && <IconButton size='small' kind='tertiary' color='fixed-light' icon={NavigationChevronLeft} onClick={() => setSessionsSidebarOpen(true)} />}
                {sessionsSidebarOpen && <IconButton size='small' kind='tertiary' color='fixed-light' icon={NavigationChevronRight} onClick={() => setSessionsSidebarOpen(false)} />}
              </Flex>
            }
            <Heading
              type='h2'
              weight='bold'
              color='fixedLight'
              className={cn({ 'invisible!': !isSmallVersion && !sessionsSidebarOpen })}
            >
              Sesiones
            </Heading>
            {!isSmallVersion && <AddSession disabled={loading || error} isToggle={sessionsSidebarOpen} />}
          </Flex>
        </Box>
      </Flex>
      {loading && <SideBarList />}
      {error && <Error title={ERROR_LOAD_SESSIONS.title} errorMessage={ERROR_LOAD_SESSIONS.description} />}
      <Box padding='medium' className='h-full'>
        {(!loading && !error) && <SessionsList
          sessions={sessions}
          sessionSelected={currentSession}
          onClickSession={handlerChange}
          isToggle={isToggle}
        />}
      </Box>
    </Box>
  )
}

export { SessionSidebar }
