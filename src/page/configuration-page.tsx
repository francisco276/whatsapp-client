import { useState } from 'react'
import { Flex, Heading, Icon, Menu, MenuItem, Divider } from '@vibe/core'
import { Settings, Person, Basic } from '@vibe/icons'
import { AccountSection } from '@/components/settings/account-section'
import { SessionsSection } from '@/components/settings/sessions-settings.tsx'
import Authorization from "@/components/layout/authorization"
import MondayContex from "@/components/layout/monday-context";

const ConfigurationPage = () => {
  const [page, setPage] = useState('account')

  return (
    <MondayContex>
      <Authorization>
        <div className="light-app-theme" style={{ height: '100vh', width: '100vw', overflow: 'hidden' }}>
          <div style={{ display: 'flex', height: '100%' }}>
            <div style={{ width: 220, minWidth: 220, height: '100%', backgroundColor: '#f7f8fa', padding: 20 }}>
              <Flex gap={10} align='center'>
                <Icon icon={Settings} className="text-gray-800" />
                <Heading type="h3" weight="bold" className="text-gray-800!">Settings</Heading>
              </Flex>
              <Divider />
              <Menu>
                <MenuItem icon={Person} title="Cuenta" onClick={() => setPage('account')} />
                <MenuItem icon={Basic} title="Sesiones" onClick={() => setPage('sessions')} />
              </Menu>
            </div>
            <div style={{ flex: 1, height: '100%', overflowY: 'auto', padding: 24, backgroundColor: '#fff' }}>
              {page === 'account' && <AccountSection />}
              {page === 'sessions' && <SessionsSection />}
            </div>
          </div>
        </div>
      </Authorization>
    </MondayContex>
  )
}

export default ConfigurationPage
