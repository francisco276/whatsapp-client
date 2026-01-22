import { useState } from 'react'
import { Box, Flex, Heading, Icon, Menu, MenuItem, Divider, Button } from '@vibe/core'
import { Settings, Person, Basic, NavigationChevronLeft } from '@vibe/icons'
import { AccountSection } from '@/components/settings/account-section'
import { SessionsSection } from '@/components/settings/sessions-settings.tsx'
import Authorization from "@/components/layout/authorization"
import MondayContex from "@/components/layout/monday-context";
import { useLocation } from 'wouter'

const ConfigurationPage = () => {
  const [page, setPage] = useState('account')
  const [, setLocation] = useLocation()

  return (
    <MondayContex>
      <Authorization>
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
                <Flex direction="column" gap={20} className="h-full">
                  <Flex direction="column" gap={10} className="w-full">
                    <Button 
                      kind="tertiary" 
                      size="small" 
                      leftIcon={NavigationChevronLeft} 
                      onClick={() => setLocation('/')}
                      className="mb-4 self-start"
                    >
                      Volver al inicio
                    </Button>
                    <Flex gap={10} align='center'>
                      <Icon icon={Settings} />
                      <Heading type="h3" weight="bold">Settings</Heading>
                    </Flex>
                    <Divider />
                    <Menu>
                      <MenuItem icon={Person} title="Cuenta" onClick={() => setPage('account')} />
                      <MenuItem icon={Basic} title="Sesiones" onClick={() => setPage('sessions')} />
                    </Menu>
                  </Flex>
                </Flex>
              </Box>
              <Box
                className="w-full h-full"
                padding="large"
              >
                {page === 'account' && <AccountSection />}
                {page === 'sessions' && <SessionsSection />}
              </Box>
            </Flex>
          </Box>
        </div>
      </Authorization>
    </MondayContex>
  )
}

export default ConfigurationPage
