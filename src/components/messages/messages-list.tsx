import { useCallback, CSSProperties, useState, useEffect, useRef } from 'react'
import { Flex, VirtualizedList } from '@vibe/core'
import type { VirtualizedListItem } from '@vibe/core'
import { Loader } from '@vibe/core'
import type { MessageItem } from '../../types/message'
import { MessageItemComponent } from '../message-item'
import { useDebounceCallback } from 'usehooks-ts'
import { getMessageSize } from '../../utils/message'

type MessagesListProps = {
  messages?: MessageItem[]
  isLoading: boolean
  onScroll: () => void | Promise<void>
}

export const MessagesList = ({ messages = [], isLoading = false, onScroll }: MessagesListProps) => {
  const listRef = useRef<HTMLElement | null>(null)
  const [scrollToId, setScrollToId] = useState<string | undefined>(undefined)
  const prevLastMessageIdRef = useRef<string | undefined>(undefined)

  const messagesElements = messages.map(message => {
    const size = getMessageSize(message)
    return {
      height: size,
      id: message.id.toString(),
      size,
      value: message
    }
  })

  useEffect(() => {
    const lastMessageId = messagesElements[messagesElements.length - 1]?.id

    if (!scrollToId && lastMessageId) {
      setScrollToId(lastMessageId)
      prevLastMessageIdRef.current = lastMessageId
      return
    }

    if (lastMessageId && lastMessageId !== prevLastMessageIdRef.current) {
      prevLastMessageIdRef.current = lastMessageId
      setScrollToId(lastMessageId)
    }

    if (isLoading && messages.length === 0) {
      setScrollToId('')
      prevLastMessageIdRef.current = undefined
    }
  }, [messages, isLoading])

  const itemRenderer = useCallback((item: VirtualizedListItem, index: number, style: CSSProperties) => {
    const message = item.value as MessageItem
    return (
      <div key={index} style={style} data-message-id={message.id.toString()}>
        <MessageItemComponent message={message} />
      </div>
    )
  }, [])

  const handleScroll = (
    horizontalScrollDirection: string,
    scrollTop: number,
    scrollUpdateWasRequested: boolean
  ) => {
    if (scrollUpdateWasRequested) return

    const isScrollNearTop = scrollTop < 100 && horizontalScrollDirection === 'backward' && !isLoading

    if (isScrollNearTop) {
      onScroll()?.then(() => {
        const lastMessage = messagesElements.find(message => !message.value.isDateSeprator)

        setTimeout(() => {
          if (lastMessage) {
            setScrollToId(lastMessage?.id)
          }
        }, 100)
      })
    }
  }

  const debounceHandleScroll = useDebounceCallback(
    (direction: string, scrollTop: number, requested: boolean) =>
      handleScroll(direction, scrollTop, requested),
    300
  )

  const setListRef = useCallback((node: HTMLElement | null) => {
    listRef.current = node;
  }, [])

  return (
    <div className='w-full flex flex-col'>
      <Flex justify='center'>
        {isLoading && <Loader size="small" />}
      </Flex>
      <div className='flex-grow'>
        <VirtualizedList
          ref={setListRef}
          getItemSize={item => item.height || 155}
          items={messagesElements}
          itemRenderer={itemRenderer}
          layout="vertical"
          scrollToId={scrollToId}
          onScroll={debounceHandleScroll}
        />
      </div>
    </div>
  )
}

