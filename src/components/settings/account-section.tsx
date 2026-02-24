import { Box, Heading } from '@vibe/core'
import { Authorization } from './authorization'
import { Notifications } from './notifications'
import { MondayToken } from './monday-token'
import { MessageUsage } from './message-usage'
import { MessageLimitAdmin } from './message-limit-admin'

export const AccountSection = () => {
  return (
    <Box className="text-gray-800">
      <Heading type="h1" weight="bold" className='!mb-px text-gray-800!'>Account</Heading>
      <MessageUsage />
      <Notifications />
      <MondayToken />
      <Authorization />
      <MessageLimitAdmin />
    </Box>
  )
}
