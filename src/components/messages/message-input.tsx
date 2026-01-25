import { useContext, useState, MouseEvent, ChangeEvent, useMemo } from 'react'
import { ChatContext } from '../providers/chat/chat-context'
import { SessionContext } from '../providers/session/session-context'
import { Flex, Icon, IconButton, Menu, MenuButton, MenuItem, TextArea, useSwitch } from '@vibe/core'
import { Attach, Send, File, Image, Video, CloseSmall, Note } from '@vibe/icons'
import { useNotifications } from '@/hooks/useNotifications'
import { useFileSelector } from '@/hooks/useFileSelector'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { TemplateSelector } from '@/components/modals/template-selector'
import { useMessageQueue } from '@/hooks/useMessageQueue'

export const MessageInput = () => {
  const workspaceId = useWorkspaceId()
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const [message, setMessage] = useState<string>('')
  const [isSending, setIsSending] = useState(false)
  const { sendNotifications } = useNotifications()
  const { handleFileSelect, selectedFiles, removeFile, formatFileSize, clearFiles } = useFileSelector()
  const { isChecked, onChange } = useSwitch()
  const { queueMessage } = useMessageQueue()

  const userCanNotSendMessage = useMemo(() => message === '' && (selectedFiles.length === 0), [message, selectedFiles])

  function handleSubmit(event: MouseEvent) {
    event.preventDefault()
    if (!userCanNotSendMessage && !isSending) {
      setIsSending(true)
      queueMessage({
        chatId: chat,
        sessionId: session,
        workspaceId,
        message: message.trim(),
        files: selectedFiles
      })
      setMessage('')
      clearFiles()
      sendNotifications()
      setTimeout(() => setIsSending(false), 500)
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value)
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (!userCanNotSendMessage && !isSending) {
        setIsSending(true)
        queueMessage({
          chatId: chat,
          sessionId: session,
          workspaceId,
          message: message.trim(),
          files: selectedFiles
        })
        setMessage('')
        clearFiles()
        sendNotifications()
        setTimeout(() => setIsSending(false), 500)
      }
    }
  }

  return (
    <div>
      <TemplateSelector onSelect={(message) => setMessage(message)} isChecked={isChecked} onChange={onChange} />
      {selectedFiles.length > 0 && (
        <div className="mb-4 space-y-2">
          <div className="text-sm font-medium text-gray-700 mb-2">Selected files:</div>
          <div className="flex flex-wrap gap-2">
            {selectedFiles.map((file) => (
              <div key={file.id} className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-2 max-w-xs">
                {file.type === 'image' && file.preview ? (
                  <img src={file.preview} alt={file.name} className="w-8 h-8 object-cover rounded mr-2" />
                ) : (
                  <div className={`w-8 h-8 rounded flex items-center justify-center mr-2 ${file.type === 'document' ? 'bg-blue-100 text-blue-600' :
                      file.type === 'video' ? 'bg-purple-100 text-purple-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                    {file.type === 'document' ? <Icon icon={File} iconType='svg' iconSize={16} /> :
                      file.type === 'video' ? <Icon icon={Video} iconType='svg' iconSize={16} /> :
                        <Icon icon={Image} iconType='svg' iconSize={16} />}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                </div>
                <IconButton
                  onClick={() => removeFile(file.id)}
                  icon={CloseSmall}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      <Flex align='center' gap={20}>
        <MenuButton className='text-[#0DACC8]!' component={Attach} disabled={isSending}>
          <Menu>
            <MenuItem icon={File} title="Documento" onClick={() => handleFileSelect('document')} />
            <MenuItem icon={Image} title="Imagen" onClick={() => handleFileSelect('image')} />
            <MenuItem icon={Video} title="Video" onClick={() => handleFileSelect('video')} />
            <MenuItem icon={Note} title="Plantilla" onClick={onChange} />
          </Menu>
        </MenuButton>
        <div onKeyDown={handleKeyDown} className="flex-1">
          <TextArea
            size='small'
            placeholder='Escribe tu mensaje'
            value={message}
            onChange={handleChange}
            resize={false}
            allowExceedingMaxLength
            rows={1}
          />
        </div>
        <IconButton
          className='bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
          ariaLabel='Enviar mensaje'
          kind='primary'
          icon={Send}
          iconClassName='text-[#A3E7F3]'
          onClick={handleSubmit}
          disabled={userCanNotSendMessage || isSending}
        />
      </Flex>
    </div>
  )
}
