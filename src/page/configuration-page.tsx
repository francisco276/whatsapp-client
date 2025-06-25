import { useState } from 'react'
import { Box, Flex, Heading, Icon, Menu, MenuItem, Divider } from '@vibe/core'
import { Settings, Person } from '@vibe/icons'
import { useContext } from '../hooks/useContext.ts'
import { MondayApi } from '../lib/monday/api'
import { AccountSection } from '@/components/settings/account-section'
import { WorkspaceProvider } from '@/components/providers/workspace/workspace-provider'

const ConfigurationPage = () => {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { workspaceId } = context
  const [page, setPage] = useState('account')

  return (
    <div>
      <Box
        className="h-screen w-screen"
      >
        <Flex>
          <Box
            className="max-w-[300px] h-screen"
            backgroundColor="allgreyBackgroundColor"
            padding="large"
          >
            <Flex gap={10} align='center'>
              <Icon icon={Settings} />
              <Heading type="h3" weight="bold">Settings</Heading>
            </Flex>
            <Divider />
            <Menu>
              <MenuItem icon={Person} title="Account" onClick={() => setPage('account')} />
            </Menu>
          </Box>
          <Box
            className="w-[50%] h-screen"
            padding="large"
          >
            <WorkspaceProvider workspaceId={workspaceId}>
              {page === 'account' && <AccountSection />}
            </WorkspaceProvider>
          </Box>
        </Flex>
      </Box>
    </div>
  )
}

export default ConfigurationPage
