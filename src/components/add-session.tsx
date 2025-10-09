import { useEffect, useState, useMemo } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addSession } from '../lib/services/sessions'
import { Button, Flex, Loader, Toast, ToastType } from "@vibe/core"
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalBasicLayout } from '@vibe/core/next'
import { Add } from '@vibe/icons'
import { SocketClient } from '../lib/socket'
import { handlerUpdateQrCode, handlerConnection } from '../lib/socket-handlers/session'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { Error } from './error'
import { ERROR_LOAD_QR } from '@/config/errors'

export const AddSession = ({ isToggle, disabled }: { isToggle: boolean, disabled?: boolean }) => {
  const queryClient = useQueryClient()
  const workspaceId = useWorkspaceId()
  const [socket, setSocket] = useState<SocketClient | null>()
  const [qrCode, setQrCode] = useState<string | null>()
  const [isOpen, setIsOpen] = useState<boolean>(false)
  const [toast, setToast] = useState({ type: '', message: '', })
  const { data, isIdle, mutate, isPending: isLoading, isError, reset } = useMutation({
    mutationKey: ['AddSession'],
    mutationFn: addSession,
    onSuccess: (data) => {
      setQrCode(data.qr)
    },
    gcTime: 0
  })

  const handleClose = () => {
    setIsOpen(false)
    reset()
    setQrCode(null)
    if (socket) {
      socket.disconnect()
      setSocket(null)
    }
  }

  const handleOpen = () => {
    const sessionId = Date.now().toString()
    setQrCode(null)
    setIsOpen(true)
    reset()
    if (isIdle) {
      mutate({ workspaceId, sessionId })
    }

    if (!workspaceId) return
    const socketConnection = new SocketClient({ workspaceId, sessionId })
    setSocket(socketConnection)
  }

  useEffect(() => {
    if (!socket) return
    
    handlerUpdateQrCode(socket, (qr) => {
      console.log({ qr }, 'updated qr')
      setQrCode(null)
      setTimeout(() => { setQrCode(qr) }, 1000)
    })

    handlerConnection(socket, ({ error, insert }) => {
      if (insert) {
        setToast({ type: 'positive', message: 'Conexión establecida correctamente.' })
        queryClient.invalidateQueries({ queryKey: ['getSessions', workspaceId] })
      }

      if (error) {
        socket.disconnect()
        setToast({ type: 'negative', message: 'Ha pasado demasiado tiempo. Inicia una nueva sesión para continuar.' })
      }
      setIsOpen(false)
      setTimeout(() => { setToast({ message: '', type: '' }) }, 2000)
    })

    return () => {
      socket.disconnect()
    }
  }, [socket, queryClient, workspaceId])

  const qr = useMemo(() => qrCode ?? data?.qr, [qrCode, data])

  return (
    <>
      <Button
        size='small'
        kind='primary'
        leftIcon={Add}
        className='w-full bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
        onClick={handleOpen}
        disabled={disabled}
      >
        {isToggle && <span>Nueva sesion</span>}
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
            title="Escanea el código QR"
          />
          <ModalContent>
            <Flex align='center' justify='center'>
              {!isError && (isLoading || (!isLoading && !qrCode)) ? <Loader size='large' className='mx-auto text-[#0DACC8]' hasBackground /> : <img src={qr} />}
            </Flex>
            {isError && <Error errorMessage={ERROR_LOAD_QR.description} />}
          </ModalContent>
        </ModalBasicLayout>
        <ModalFooter
          secondaryButton={{
            text: 'Cancelar',
            onClick: handleClose
          }}
          primaryButton={{
            text: "Cerrar",
            onClick: handleClose,
            className: 'bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
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
