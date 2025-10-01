import { useState } from 'react'
import { IconButton, Flex, Box, Heading } from '@vibe/core'
import { NavigationChevronLeft, NavigationChevronRight } from '@vibe/icons'
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

  return (
    <Box
      className={cn(
        'bg-white border-slate-200! transition-all!',
        chatsSidebarOpen ? 'w-xs! min-w-xs! max-w-xs!' : 'w-[100px]! min-w-[100px]! max-w-[100px]!'
      )}
      border
    >
      <Flex direction='column' className='h-screen'>
        <Box className='w-full border-b! border-x-0 border-slate-200! h-[146px] min-h-[146px]' padding="medium">
          <Flex direction='column' align='start' gap={10}>
            <Flex gap={10} className='ml-auto transition-all duration-300'>
              {!chatsSidebarOpen && <IconButton size='small' kind='tertiary' icon={NavigationChevronLeft} onClick={() => setChatsSidebarOpen(true)} />}
              {chatsSidebarOpen && <IconButton size='small' kind='tertiary' icon={NavigationChevronRight} onClick={() => setChatsSidebarOpen(false)} />}
            </Flex>
            <Heading type='h2' weight='bold' className={`${chatsSidebarOpen ? '' : 'invisible!'}`}>Chats</Heading>
          </Flex>
        </Box>
        {error && <Error title={ERROR_LOAD_CONTACT.title} errorMessage={ERROR_LOAD_CONTACT.title} />}
        {loading && <SideBarList />}
        <Box className='flex-1! w-full flex justify-start'>
          {(!loading && !error) && (
            <ChatList
              chats={chats}
              isToggle={chatsSidebarOpen}
              />
          )
          }
        </Box>
      </Flex>
    </Box>
  )
}

export { ChatsSidebar }
