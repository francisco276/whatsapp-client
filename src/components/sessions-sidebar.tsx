import { ERROR_LOAD_SESSIONS } from '@/config/errors'
import { Session } from '@/types'
import { cn } from '@/utils/utils'
import { Box, Flex, Heading, IconButton, Text } from '@vibe/core'
import { ContentDirectory, NavigationChevronLeft, NavigationChevronRight, Send, Settings } from '@vibe/icons'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MondayApi } from '../lib/monday/api'
import { AddSession } from './add-session'
import { Error } from './error'
import { SessionContext } from './providers/session/session-context'
import { SessionsList } from './sessions/sessions-list'
import { SideBarList } from './skeletons/sidebar-list'
import { Link } from 'wouter'
import { useMessageCounterStore } from '@/stores/messageCounterStore'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { BulkMessageModal } from './sessions/bulk-message-modal'

type SessionSidebarProps = {
  type?: 'small' | 'full'
  sessions: Session[]
  loading: boolean
  error: boolean
}

const SessionSidebar = ({ sessions, loading, type = 'full', error }: SessionSidebarProps) => {
  const monday = new MondayApi()
  const workspaceId = useWorkspaceId()
  const { session: currentSession, setSession } = useContext(SessionContext)
  const [sessionsSidebarOpen, setSessionsSidebarOpen] = useState(true)
  const [showBulkModal, setShowBulkModal] = useState(false)
  const { sentCount, setWorkspaceId, fetchCount } = useMessageCounterStore()

  useEffect(() => {
    if (workspaceId) {
      setWorkspaceId(workspaceId)
      fetchCount()
    }
  }, [workspaceId, setWorkspaceId, fetchCount])

  useEffect(() => {
    if (!currentSession && sessions.length > 0 && !loading && !error) {
      setSession(sessions[0].id)
    }
  }, [sessions, currentSession, loading, error, setSession])

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
                {sessionsSidebarOpen && (
                  <>
                    <Link href="/templates">
                      <IconButton size='small' kind='tertiary' color='fixed-light' icon={ContentDirectory} tooltipProps={{ content: 'Plantillas' }} />
                    </Link>
                    <IconButton size='small' kind='tertiary' color='fixed-light' icon={Send} onClick={() => setShowBulkModal(true)} tooltipProps={{ content: 'Mensajes masivos' }} />
                  </>
                  )
                }
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
            <Text
              type='text2'
              color='fixedLight'
              className={cn('opacity-80', { 'invisible!': !isSmallVersion && !sessionsSidebarOpen })}
            >
              Mensajes enviados: {sentCount}
            </Text>
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

      {showBulkModal && (
        <BulkMessageModal onClose={() => setShowBulkModal(false)} />
      )}
    </Box>
  )
}

export { SessionSidebar }
