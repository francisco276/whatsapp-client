import { useState, useMemo } from 'react'
import { IconButton, Flex, Box, Heading, TextField, Text } from '@vibe/core'
import { NavigationChevronLeft, NavigationChevronRight, Search } from '@vibe/icons'
import { SideBarList } from './skeletons/sidebar-list'
import { ChatList } from './list/chats-list'
import { Error } from './error'
import { ERROR_LOAD_CONTACT } from '../config/errors'
import { cn } from '@/utils/utils'
import { Chat } from '@/lib/services/chats'

type ChatSidebarProps = {
  chats: Chat[]
  loading: boolean
  error: boolean
}

const ChatsSidebar = ({ chats, loading, error }: ChatSidebarProps) => {
  const [chatsSidebarOpen, setChatsSidebarOpen] = useState(true)
  const [search, setSearch] = useState('')

  const filteredChats = useMemo(() => {
    if (!search) return chats
    return chats.filter(chat => 
      chat.name?.toLowerCase().includes(search.toLowerCase()) || 
      chat.id?.toLowerCase().includes(search.toLowerCase())
    )
  }, [chats, search])

  return (
    <Box
      className={cn(
        'bg-white border-slate-200! transition-all!',
        chatsSidebarOpen ? 'w-xs! min-w-xs! max-w-xs!' : 'w-[100px]! min-w-[100px]! max-w-[100px]!'
      )}
      border
    >
      <Flex direction='column' className='h-screen'>
        <Box className='w-full border-b! border-x-0 border-slate-200! h-[190px] min-h-[190px]' padding="medium">
          <Flex direction='column' align='start' gap={10}>
            <Flex gap={10} className='ml-auto transition-all duration-300'>
              {!chatsSidebarOpen && <IconButton size='small' kind='tertiary' icon={NavigationChevronLeft} onClick={() => setChatsSidebarOpen(true)} />}
              {chatsSidebarOpen && <IconButton size='small' kind='tertiary' icon={NavigationChevronRight} onClick={() => setChatsSidebarOpen(false)} />}
            </Flex>
            <Heading type='h2' weight='bold' className={`${chatsSidebarOpen ? '' : 'invisible!'}`}>Chats</Heading>
            {chatsSidebarOpen && (
              <Box className="w-full mt-2">
                <TextField
                  placeholder="Buscar contacto..."
                  size="small"
                  value={search}
                  onChange={(val) => setSearch(val)}
                  iconName={Search}
                />
              </Box>
            )}
          </Flex>
        </Box>
        {error && <Error title={ERROR_LOAD_CONTACT.title} errorMessage={ERROR_LOAD_CONTACT.title} />}
        {loading && <SideBarList />}
        <Box className='flex-1! w-full flex justify-start'>
          {(!loading && !error) && (
            <ChatList
              chats={filteredChats}
              isToggle={chatsSidebarOpen}
              />
          )
          }
        </Box>
        <div className="p-4 border-t border-slate-100 mt-auto">
          <Text type="text3" color="secondary" className="opacity-50">v16</Text>
        </div>
      </Flex>
    </Box>
  )
}

export { ChatsSidebar }
