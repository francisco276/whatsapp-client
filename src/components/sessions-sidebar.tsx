import { useState, useContext } from 'react'

import { SessionContext } from './providers/session/session-context'
import { AddSession } from './add-session'
import { SessionButton } from './session-button'

import { NavigationChevronLeft, NavigationChevronRight, Settings } from '@vibe/icons'
import { IconButton } from '@vibe/core'
import { SideBarList } from './skeletons/sidebar-list'
import { MondayApi } from '../lib/monday/api'

type Session = {
  id: string,
  isSynced: boolean
}

type SessionSidebarProps = {
  sessions: Session[],
  isLoading?: boolean
  error?: boolean
}

const SessionSidebar = ({ sessions = [], isLoading = false, error }: SessionSidebarProps) => {
  const monday = new MondayApi()
  const { session: currentSession, setSession } = useContext(SessionContext)
  const [sessionsSidebarOpen, setSessionsSidebarOpen] = useState(true)

  function handleOpenModal() {
    monday.execute("openAppFeatureModal", { urlPath: '/config', width: 900, height: 700 })
  }

  return <div className={`transition-all duration-300 flex flex-col ${sessionsSidebarOpen ? 'w-64' : 'w-16'
    }`}>
    <div className="p-4 flex items-center">
      <h2 className={`font-bold ${!sessionsSidebarOpen && 'hidden'}`}>Cuentas</h2>
      {sessionsSidebarOpen && <IconButton className="ml-auto" size='small' icon={Settings} onClick={handleOpenModal} />}
      <IconButton
        onClick={() => setSessionsSidebarOpen(!sessionsSidebarOpen)}
        size='small'
        ariaLabel={sessionsSidebarOpen ? 'Cerrar' : 'Abrir'}
        icon={sessionsSidebarOpen ? NavigationChevronLeft : NavigationChevronRight}
      />
    </div>

    <div className="p-2 flex-1 flex flex-col">
      <AddSession disabled={isLoading || error} isToggle={sessionsSidebarOpen} />
      {isLoading && <SideBarList />}
      {!isLoading && sessions.map(session => (
        <SessionButton
          sessionId={session.id}
          key={session.id}
          onClick={() => setSession(session.id)}
          isSelected={currentSession === session.id}
          isSynced={session.isSynced}
          isToggle={sessionsSidebarOpen}
        />
      ))}
    </div>
  </div>
}

export { SessionSidebar }
