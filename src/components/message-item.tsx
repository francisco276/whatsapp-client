import { useQuery } from '@tanstack/react-query'
import { getContact } from "../lib/services/contacts"
import type { MessageItem } from "../types/message"
import { downloadMedia } from "../lib/services/messages"
import { MessageImageComponent } from './messages/formats/image'
import { MessageDocumentComponent } from './messages/formats/document'
import { Icon } from '@vibe/core'
import { Forward } from '@vibe/icons'
import { MessageVideoComponent } from './messages/formats/video'

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

  const { data: mediaUrl } = useQuery({
    queryKey: ['getMedia', message],
    queryFn: () => downloadMedia({ workspaceId, sessionId, message: originalMessage }),
    enabled: (isImage || isVideo || isSticker),
    refetchOnWindowFocus: false,
    staleTime: 1440 * 60 * 1000
  })


  return (
    <div
      className={`flex mb-2.5 
        ${isDateSeprator && 'justify-center'}
        ${(isMyMessage && !isDateSeprator) && 'justify-end'}
          ${(!isMyMessage && !isDateSeprator) && 'justify-start'}
      `}
    >
      <div
        className={`max-w-xs md:max-w-md rounded-lg px-4 py-2
          ${isDateSeprator && 'bg-stone-950 text-white'}
          ${(isMyMessage && !isDateSeprator) && '!bg-blue-500 !text-white rounded-br-none'}
          ${(!isMyMessage && !isDateSeprator) && '!bg-gray-200 !rounded-bl-none'}
        `}
      >
        {!isMyMessage && isAGroup && (
          <div className="font-semibold text-sm">{contact?.name || message.pushName}</div>
        )}

        {isForwarded && <p className="text-gray-500 flex gap-2 items-center"><Icon iconType="svg" icon={Forward} iconLabel="forwarded" iconSize={16} />Forwarded</p>}

        {((isImage || isSticker) && mediaUrl) && <MessageImageComponent url={mediaUrl} />}
        {(isDocument && documentTitle) && <MessageDocumentComponent name={documentTitle} />}
        {(isVideo && mediaUrl) && <MessageVideoComponent url={mediaUrl} isGift={isGift!} />}
        <p>{messageString}</p>

        <div className={`text-xs mt-1 ${isMyMessage ? '!text-blue-100' : '!text-gray-500'}`}>
          {!isDateSeprator && timestamp.toString()}
        </div>
      </div>
    </div>
  )
}
