import { useContext, useCallback } from "react"
import { useInfiniteQuery } from "@tanstack/react-query"
import { SessionContext } from './providers/session/session-context'
import { ChatContext } from "./providers/chat/chat-context"
import { getMessages } from "../lib/services/messages"
import { MessagesList } from "./messages/messages-list"
import { Error } from '../components/error'
import { ERROR_LOAD_MESSAGES_HISTORY } from '../config/errors'
import { mapMessageToElement, groupMessagesByDate } from '../utils/message'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { Chat as ChatWrapper } from "@/components/layout/chat"
import { useSelectChat } from "@/hooks/useSelectChat"

export const Chat = () => {
  const workspaceId = useWorkspaceId()
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

  useSelectChat((messagesData?.pages.flatMap(page => page.data) ?? []))

  const handleScroll = useCallback(async () => {
    if (hasNextPage && !isFetchingNextPage) {
      await fetchNextPage()
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isError) {
    return (
      <ChatWrapper>
        <Error title={ERROR_LOAD_MESSAGES_HISTORY.title} errorMessage={ERROR_LOAD_MESSAGES_HISTORY.description} />
      </ChatWrapper>
    )
  }

  const allMessages = groupMessagesByDate((messagesData?.pages.flatMap(page => page.data) ?? [])
    .map(message => mapMessageToElement(message)).reverse())

  return (
    <ChatWrapper>
      <div className="flex flex-1 bg-slate-100">
        <MessagesList
          messages={allMessages}
          isLoading={isFetching || isFetchingNextPage}
          onScroll={handleScroll}
        />
      </div>
    </ChatWrapper>
  )
}
