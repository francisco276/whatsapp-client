import { useContext, useState, MouseEvent, ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatContext } from '../providers/chat/chat-context'
import { SessionContext } from '../providers/session/session-context'
import { sendMessage } from '../../lib/services/messages'
import { Flex, IconButton, TextArea } from '@vibe/core'
import { Send } from '@vibe/icons'
import { useNotifications } from '@/hooks/useNotifications'

export const MessageInput = ({ workspaceId }: { workspaceId: string }) => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string>('')
  const { sendNotifications } = useNotifications()

  const { mutate } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', session, chat, workspaceId] })
      sendNotifications()
    }
  })

  function handleSubmit(event: MouseEvent) {
    try {
      event.preventDefault()
      if (message) {
        mutate({
          chatId: chat,
          sessionId: session,
          workspaceId,
          message: message.trim()
        })
        setMessage('')
      }
    } catch (error) {
      console.log('Error', error)
    }
  }

  function handleChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value)
  }
  return (
    <Flex align='center' gap={20}>
      <TextArea
        size='small'
        placeholder='Escribe tu mensaje'
        value={message}
        onChange={handleChange}
        resize={false}
        allowExceedingMaxLength
        rows={1}
      />
      <IconButton
        ariaLabel='Enviar mensaje'
        kind='primary'
        icon={Send}
        onClick={handleSubmit}
        disabled={message === ''}
      />
    </Flex>
  )
}
