import { Box, Heading } from '@vibe/core'
import { Authorization } from './authorization'
import { Notifications } from './notifications'

export const AccountSection = () => {
  return (
    <Box className="text-gray-800">
      <Heading type="h1" weight="bold" className='!mb-px text-gray-800!'>Account</Heading>
      <Notifications />
      <Authorization />
    </Box>
  )
}
