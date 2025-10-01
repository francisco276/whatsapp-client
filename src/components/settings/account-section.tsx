import { Box, Heading } from '@vibe/core'
import { Authorization } from './authorization'
import { Notifications } from './notifications'

export const AccountSection = () => {
  return (
    <Box>
      <Heading type="h1" weight="bold" className='!mb-px'>Account</Heading>
      <Notifications />
      <Authorization />
    </Box>
  )
}
