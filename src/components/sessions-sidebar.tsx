import { useState, useContext } from 'react'

import { SessionContext } from './providers/session/session-context'
import { AddSession } from './add-session'
import { SessionButton } from './session-button'

import { NavigationChevronLeft, NavigationChevronRight } from '@vibe/icons'
import { IconButton } from '@vibe/core'
import { SideBarList } from './skeletons/sidebar-list'


type Session = {
  id: string
}

type SessionSidebarProps = {
  sessions: Session[],
  workspaceId: string
  isLoading?: boolean
  error?: boolean
}

const SessionSidebar = ({ workspaceId, sessions = [], isLoading = false, error }: SessionSidebarProps ) => {
  const { session: currentSession, setSession } = useContext(SessionContext)
  const [sessionsSidebarOpen, setSessionsSidebarOpen] = useState(true)

  return  <div className={`transition-all duration-300 flex flex-col ${
    sessionsSidebarOpen ? 'w-64' : 'w-16'
  }`}>
    <div className="p-4 flex justify-between items-center">
      <h2 className={`font-bold ${!sessionsSidebarOpen && 'hidden'}`}>Cuentas</h2>
      { sessionsSidebarOpen }
      <IconButton
        onClick={() => setSessionsSidebarOpen(!sessionsSidebarOpen)}
        size='small'
        ariaLabel={sessionsSidebarOpen ? 'Cerrar' : 'Abrir' }
        icon={sessionsSidebarOpen ? NavigationChevronLeft : NavigationChevronRight }
      />
    </div>
    
    <div className="p-2 flex-1 flex flex-col">
      <AddSession disabled={isLoading || error} isToggle={sessionsSidebarOpen} workspaceId={workspaceId} />
      { isLoading && <SideBarList /> }
      {!isLoading && sessions.map(session => (
        <SessionButton
          workspaceId={workspaceId}
          sessionId={session.id}
          key={session.id}
          onClick={() => setSession(session.id)}
          isSelected={currentSession === session.id}
          isToggle={sessionsSidebarOpen}
        />
      ))}
    </div>
  </div>
}

export { SessionSidebar }
