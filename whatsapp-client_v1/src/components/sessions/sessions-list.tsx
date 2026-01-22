import type { Session } from '@/types'
import { SessionButton } from '@/components/session-button'
import { EmptyState } from '../empty-state'
import { Box } from '@vibe/core'

type SessionsList = {
  sessions: Session[]
  sessionSelected: string
  onClickSession: (id: string) => void
  isToggle: boolean
}

export const SessionsList = ({ sessions, onClickSession, sessionSelected, isToggle }: SessionsList) => {
  if (sessions.length === 0) {
    return <Box className='h-full'>
      <EmptyState description='Agrega una nueva sesion' />
    </Box>
  }

  return sessions.map(session => (
    <SessionButton
      sessionId={session.id}
      key={session.id}
      onClick={() => onClickSession(session.id)}
      isSelected={sessionSelected === session.id}
      isSynced={session.isSynced}
      isToggle={isToggle}
    />
  ))
}
