import { useState, useContext } from 'react'
import { useQuery } from '@tanstack/react-query'
import { SessionContext } from './providers/session/session-context'

import { IconButton, AttentionBox } from '@vibe/core'
import { NavigationChevronLeft, NavigationChevronRight, Info } from '@vibe/icons'

import { getChats } from '../lib/services/chats'
import { SideBarList } from './skeletons/sidebar-list'
import { ChatList } from './list/chats-list'
import { Error } from './error'
import { ERROR_SERVER_ERROR } from '../config/errors'


type ChatsSidebarProps = {
  workspaceId: string
}

const ChatsSidebar = ({ workspaceId }: ChatsSidebarProps) => {
  const { session } = useContext(SessionContext)
  const [chatsSidebarOpen, setChatsSidebarOpen] = useState(true)

  const { data, isLoading, isSuccess, isPending, isError } = useQuery({
    queryKey: ['getSessions', session],
    queryFn: () => getChats({ workspaceId, sessionId: session }),
    enabled: !!session
  })

  return (
    <div className={`bg-gray-100 border-r border-r-gray-200 transition-all duration-300 flex flex-col ${chatsSidebarOpen ? 'w-64' : 'w-16'
      }`}>
      <div className="p-4 flex justify-between items-center">
        <h2 className={`font-bold ${!chatsSidebarOpen && 'hidden'}`}>Chats</h2>
        <IconButton
          size='small'
          onClick={() => setChatsSidebarOpen(!chatsSidebarOpen)}
          ariaLabel={chatsSidebarOpen ? 'Cerrar' : 'Abrir'}
          icon={chatsSidebarOpen ? NavigationChevronLeft : NavigationChevronRight}
          disabled={isError}
        />
      </div>
      <div className="p-2 flex-1 flex">
        {isPending && chatsSidebarOpen && (
          <AttentionBox
            title="Selecciona una cuenta"
            text="Debes elegir una cuenta para ver o listar los chats disponibles."
            icon={Info}
          />
        )}
        { isLoading && <SideBarList /> }
        { isError && <Error errorMessage={ERROR_SERVER_ERROR} /> }
        { isSuccess && <ChatList chats={data.chats} isToggle={chatsSidebarOpen} workspaceId={workspaceId} /> }
      </div>
    </div>
  )
}

export { ChatsSidebar }
