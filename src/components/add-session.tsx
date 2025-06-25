import { useEffect, useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addSession } from '../lib/services/sessions'

import { Button, Flex, Skeleton, Toast, ToastType } from "@vibe/core"
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalBasicLayout } from '@vibe/core/next'
import { Add } from '@vibe/icons'
import { SocketClient } from '../lib/socket'
import { handlerUpdateQrCode, handlerConnection } from '../lib/socket-handlers/session'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'

export const AddSession = ({ isToggle, disabled }: { isToggle: boolean, disabled?: boolean }) => {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()
  const [socket, setSocket] = useState<SocketClient | null>()
  const [qrCode, setQrCode] = useState<string | null>()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [toast, setToast] = useState({ type: '', message: '', })
  const { data, isIdle, mutate, isPending: isLoading } = useMutation({
    mutationFn: addSession
  })

  const handleClose = () => setIsOpen(false)
  const handleOpen = () => {
    const sessionId = Date.now().toString()
    setIsOpen(true)
    if (isIdle) {
      mutate({ workspaceId, sessionId })
    }

    const socket = new SocketClient({ workspaceId, sessionId })
    setSocket(socket)
  }

  useEffect(() => {
    if (socket) {

      handlerUpdateQrCode(socket, (qr) => {
        setQrCode(null)
        setTimeout(() => { setQrCode(qr) }, 1000)
      })

      handlerConnection(socket, ({ error, message, insert }) => {
        if (insert) {
          setToast({ type: 'positive', message })
          queryClient.invalidateQueries({ queryKey: ['getSessions', workspaceId] })
        }

        if (error) {
          socket.disconnect()
          setToast({ type: 'negative', message: message })
        }
        setIsOpen(false)
        setTimeout(() => { setToast({ message: '', type: '' }) }, 2000)
      })
    }

    return () => {
      socket?.disconnect()
    }
  }, [socket])

  const qr = useMemo(() => qrCode ?? data?.qr, [qrCode, data])

  return (
    <>
      <Button
        kind='tertiary'
        leftIcon={Add}
        className='w-full'
        onClick={handleOpen}
        disabled={disabled}
      >
        {isToggle && <span>New Session</span>}
      </Button>
      <Modal
        id="modal-basic-small"
        show={isOpen}
        size="medium"
        onClose={handleClose}
        alertModal
      >
        <ModalBasicLayout>
          <ModalHeader
            title="Escanee el código QR para añadir una cuenta"
          />
          <ModalContent>
            <Flex align='center' justify='center'>
              {isLoading || (!isLoading && !qrCode) ? <Skeleton /> : <img src={qr} />}
            </Flex>
          </ModalContent>
        </ModalBasicLayout>
        <ModalFooter
          primaryButton={{
            text: "Cerrar",
            onClick: handleClose,
          }}
        />
      </Modal>
      <Toast
        open={!!toast.message}
        type={toast.type as ToastType}
        autoHideDuration={5000}
        className="monday-storybook-toast_wrapper"
      >
        {toast.message}
      </Toast>
    </>
  )
}
