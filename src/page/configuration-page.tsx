import { useState } from 'react'
import { Box, Flex, Heading, Icon, Menu, MenuItem, Divider } from '@vibe/core'
import { Settings, Person, Basic } from '@vibe/icons'
import { useContext } from '../hooks/useContext.ts'
import { MondayApi } from '../lib/monday/api'
import { AccountSection } from '@/components/settings/account-section'
import { WorkspaceProvider } from '@/components/providers/workspace/workspace-provider'
import { SessionsSection } from '@/components/settings/sessions-settings.tsx'

const ConfigurationPage = () => {
  const monday = new MondayApi()
  const { context } = useContext({ monday })
  const { accountId: workspaceId } = context
  const [page, setPage] = useState('account')

  return (
    <div>
      <Box
        className="h-screen w-screen"
      >
        <Flex align='start' className='h-full'>
          <Box
            className="w-[300px] max-w-[300px] h-full"
            backgroundColor="allgreyBackgroundColor"
            padding="large"
          >
            <Flex gap={10} align='center'>
              <Icon icon={Settings} />
              <Heading type="h3" weight="bold">Settings</Heading>
            </Flex>
            <Divider />
            <Menu>
              <MenuItem icon={Person} title="Cuenta" onClick={() => setPage('account')} />
              <MenuItem icon={Basic} title="Sesiones" onClick={() => setPage('sessions')} />
            </Menu>
          </Box>
          <Box
            className="w-full h-full"
            padding="large"
          >
            <WorkspaceProvider workspaceId={workspaceId}>
              {page === 'account' && <AccountSection />}
              {page === 'sessions' && <SessionsSection />}
            </WorkspaceProvider>
          </Box>
        </Flex>
      </Box>
    </div>
  )
}

export default ConfigurationPage
