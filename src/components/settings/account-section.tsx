import { Box, Heading } from '@vibe/core'
import { RemoveSession } from './remove-session'
import { Authorization } from './authorization'
import { Notifications } from './notifications'

export const AccountSection = () => {
  return (
    <Box>
      <Heading type="h1" weight="bold" className='!mb-px'>Account</Heading>
      <RemoveSession />
      <Notifications />
      <Authorization />
    </Box>
  )
}
