import { useContext, useState, MouseEvent, ChangeEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ChatContext } from '../providers/chat/chat-context'
import { SessionContext } from '../providers/session/session-context'
import { sendMessage } from '../../lib/services/messages'
import { Button } from '@vibe/core'

export const MessageInput = () => {
  const { session } = useContext(SessionContext)
  const { chat } = useContext(ChatContext)
  const queryClient = useQueryClient()
  const [message, setMessage] = useState<string>('')

  const { mutate } = useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mesages', session, chat] })
    }
  })

  function handleSubmit(event: MouseEvent<HTMLButtonElement>) {
    try {
      event.preventDefault()
      if (message) {
        mutate({
          chatId: chat,
          sessionId: session,
          workspaceId: '1234',
          message
        })
        setMessage('')
      }
    } catch (error) {
      console.log('Error', error)
    }
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setMessage(event.target.value)
  }
  return (
    <div className='flex'>
      <input
        type="text"
        placeholder="Type a message..."
        value={message}
        onChange={handleChange}
        className="w-full p-2 border rounded"
      />
      <Button
        onClick={handleSubmit}
      >
        Send message
      </Button>
    </div>
  )
}
