import { Box, Heading } from '@vibe/core'
import { RemoveSession } from './remove-session'
import { SessionProvider } from '../providers/session/session-provider'
import { SessionAccess } from '../sessions/session-acess'

export const SessionsSection = () => {
  return (
    <Box className="text-gray-800">
      <Heading type="h1" weight="bold" className='!mb-px text-gray-800!'>Sesiones</Heading>
      <SessionProvider>
        <>
          <RemoveSession />
          <SessionAccess />
        </>
      </SessionProvider>
    </Box>
  )
}
