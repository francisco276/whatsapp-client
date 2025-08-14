import { useCallback, CSSProperties } from 'react'
import { VirtualizedList } from '@vibe/core'
import type { VirtualizedListItem } from '@vibe/core'
import type { Chat } from '../../lib/services/chats'
import { ContactItem } from '../contact-item'

type ChatListProps = {
  chats: Chat[]
  isToggle: boolean
  workspaceId: string
}

export const ChatList = ({ chats = [], isToggle, workspaceId }: ChatListProps) => {

  const chatsElementes = chats.map(chat => ({
    height: 64,
    id: chat.pkId,
    size: 58,
    value: chat.id
  }))

  const itemRenderer = useCallback((item: VirtualizedListItem, _: number, style: CSSProperties) => {
    return (
      <div key={item.value as string} style={{ ...style }} className='p-4 pb-0'>
        <ContactItem
          workspaceId={workspaceId}
          contactId={item.value as string}
          isToggle={isToggle}
        />
      </div>
    )
  }, [isToggle])

  return (
    <div
      className='w-full'
    >
      <VirtualizedList
        getItemSize={item => item.height || 40}
        items={chatsElementes}
        itemRenderer={itemRenderer}
        layout="vertical"
        onItemsRenderedThrottleMs={0}
        overscanCount={2}
      />
    </div>
  )
}
