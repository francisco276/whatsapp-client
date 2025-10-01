import { useQuery } from '@tanstack/react-query'
import { getContact } from "../lib/services/contacts"
import type { MessageItem } from "../types/message"
import { downloadMedia } from "../lib/services/messages"
import { MessageImageComponent } from './messages/formats/image'
import { MessageDocumentComponent } from './messages/formats/document'
import { Icon, Loader } from '@vibe/core'
import { Forward } from '@vibe/icons'
import { MessageVideoComponent } from './messages/formats/video'
import { getTime } from '@/utils/time'

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

  const { data: contact } = useQuery({
    queryKey: ['getContact', participant],
    queryFn: () => getContact({ id: participant, workspaceId, sessionId }),
    enabled: isAGroup,
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })

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
        className={`max-w-xs md:max-w-md rounded-lg text-wrap text-ellipsis whitespace-pre-line
          ${(isMyMessage && !isDateSeprator) && 'bg-[#0DACC8] text-white rounded-br-none px-4 py-2'}
          ${(!isMyMessage && !isDateSeprator) && 'bg-white text-slate-900 border border-slate-200 rounded-bl-none px-4 py-2'}
        `}
      >
        {!isMyMessage && isAGroup && (
          <div className="text-sm">{contact?.name || message.pushName}</div>
        )}

        {isForwarded && <p className="text-gray-500 flex gap-2 items-center"><Icon iconType="svg" icon={Forward} iconLabel="forwarded" iconSize={16} />Forwarded</p>}

        {isLoadingMedia && <Loader size="small" />}
        {((isImage || isSticker) && mediaUrl) && <MessageImageComponent url={mediaUrl} />}
        {(isDocument && documentTitle) && <MessageDocumentComponent name={documentTitle} />}
        {(isVideo && mediaUrl) && <MessageVideoComponent url={mediaUrl} isGift={isGift!} />}
        {
          isDateSeprator && (
            <div className="flex justify-center">
              <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full font-medium">
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
