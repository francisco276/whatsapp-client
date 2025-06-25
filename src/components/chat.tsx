import { Flex } from '@vibe/core'
import { useContext, useCallback } from "react"
import { useQuery, useInfiniteQuery } from "@tanstack/react-query"
import { SessionContext } from './providers/session/session-context'
import { ChatContext } from "./providers/chat/chat-context"
import { getMessages } from "../lib/services/messages"
import { MessagesList } from "./messages/messages-list"
import { MessageInput } from "./messages/message-input"
import { getContact } from "../lib/services/contacts"
import { Error } from '../components/error'
import { ERROR_SERVER_ERROR } from '../config/errors'
import { mapMessageToElement, groupMessagesByDate } from '../utils/message'

type ChatProps = {
  workspaceId: string
}

export const Chat = ({ workspaceId }: ChatProps) => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)

  const {
    data: messagesData,
    isError,
    isFetching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['messages', session, chat, workspaceId],
    queryFn: ({ pageParam }: { pageParam?: number | string }) => getMessages({
      workspaceId,
      sessionId: session,
      chatId: chat,
      offset: pageParam
    }),
    enabled: !!(session && chat),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.offset,
  })

  const { data: contact } = useQuery({
    queryKey: ['getContact', chat],
    queryFn: () => getContact({ id: chat, workspaceId, sessionId: session }),
    enabled: !!chat,
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  const allMessages = groupMessagesByDate((messagesData?.pages.flatMap(page => page.data) ?? [])
    .map(message => mapMessageToElement(message)).reverse())

  const handleScroll = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white p-4 shadow">
        <h1 className="font-bold">
          {contact?.name}
        </h1>
      </div>
      {isError && <Flex align='center' justify='center' className='m-auto w-max-[80%]' ><Error errorMessage={ERROR_SERVER_ERROR} /></Flex>}
      {
        !isError && (
          <div className="flex flex-1">
            {
              <MessagesList
                messages={allMessages}
                isLoading={isFetching || isFetchingNextPage}
                onScroll={handleScroll}
              />
            }
          </div>
        )
      }
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <MessageInput workspaceId={workspaceId} />
      </div>
    </div>
  )
}
