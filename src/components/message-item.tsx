import { useQuery } from '@tanstack/react-query'
import type { MessageItem } from "../types/message"
import { downloadMedia } from "../lib/services/messages"
import { MessageImageComponent } from './messages/formats/image'
import { MessageDocumentComponent } from './messages/formats/document'
import { Icon, Loader } from '@vibe/core'
import { Forward } from '@vibe/icons'
import { MessageVideoComponent } from './messages/formats/video'
import { getTime } from '@/utils/time'
import { useGetContact } from '@/hooks/useGetContact'

export const MessageItemComponent = ({ message }: { message: MessageItem }) => {
  const {
    isAGroup,
    isMyMessage,
    message: {
      text: messageString,
      isImage,
      isVideo,
      isSticker,
      isDocument,
      documentTitle,
      isForwarded,
      isGift,
    },
    timestamp,
    participant,
    workspaceId,
    sessionId,
    isDateSeprator,
    originalMessage
  } = message

  const { contact } = useGetContact({ contactId: participant, enabled: isAGroup })

  const { data: mediaUrl, isLoading: isLoadingMedia } = useQuery({
    queryKey: ['getMedia', message],
    queryFn: () => downloadMedia({ workspaceId, sessionId, message: originalMessage }),
    enabled: (isImage || isVideo || isSticker),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

  return (
    <div
      className={`flex mb-2.5 px-4
        ${isDateSeprator ? 'justify-center' : ''}
        ${(isMyMessage && !isDateSeprator) ? 'justify-end' : ''}
          ${(!isMyMessage && !isDateSeprator) ? 'justify-start' : ''}
      `}
    >
      <div
        className={`max-w-xs md:max-w-md rounded-2xl text-wrap text-ellipsis whitespace-pre-line shadow-sm transition-all hover:shadow-md
          ${(isMyMessage && !isDateSeprator) && 'bg-gradient-to-br from-[#0DACC8] to-[#0B8AA0] text-white rounded-br-none px-4 py-2.5'}
          ${(!isMyMessage && !isDateSeprator) && 'bg-[var(--primary-background-color)] text-[var(--primary-text-color)] border border-[var(--ui-border-color)] rounded-bl-none px-4 py-2.5'}
        `}
      >
        {!isMyMessage && isAGroup && (
          <div className="text-sm font-semibold" style={{ color: 'var(--primary-color)' }}>{contact?.displayName}</div>
        )}

        {isForwarded && <p className="text-gray-500 flex gap-2 items-center"><Icon iconType="svg" icon={Forward} iconLabel="forwarded" iconSize={16} />Forwarded</p>}

        {isLoadingMedia && <Loader size="small" />}
        {((isImage || isSticker) && mediaUrl) && <MessageImageComponent url={mediaUrl} />}
        {(isDocument && documentTitle) && <MessageDocumentComponent name={documentTitle} />}
        {(isVideo && mediaUrl) && <MessageVideoComponent url={mediaUrl} isGift={isGift!} />}
        {
          isDateSeprator && (
            <div className="flex justify-center">
              <div className="bg-[var(--secondary-background-color)] text-[var(--secondary-text-color)] text-sm px-4 py-2 rounded-full font-medium">
                {messageString}
              </div>
            </div>
          )
        }
        {!isDateSeprator && messageString}

        <div className={`text-xs mt-1 text-right ${isMyMessage ? '!text-blue-100' : '!text-gray-500'}`}>
          {!isDateSeprator && getTime({ date: timestamp })}
        </div>
      </div>
    </div>
  )
}
