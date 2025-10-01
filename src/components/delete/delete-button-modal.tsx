import { useState, useCallback } from 'react'
import { Text, IconButton } from '@vibe/core'
import { Delete } from '@vibe/icons'
import { Modal, ModalHeader, ModalContent, ModalFooter, ModalBasicLayout } from '@vibe/core/next'

type DeleteButtonModalProps = {
  title: string,
  description: string
  buttonClassName?: string
  loading?: boolean
  onConfirm?: () => Promise<void> | void
  onCancel?: () => Promise<void>
}

export const DeleteButtonModal = ({ title, description, buttonClassName, loading = false, onConfirm, onCancel }: DeleteButtonModalProps) => {
  const [show, setShow] = useState(false)

  const handlerConfirm = useCallback(async () => {
    if (onConfirm) {
      await onConfirm()
    }
    setShow(false)
    return
  }, [onConfirm])

  const handlerCancel = useCallback(() => {
    if (onCancel) {
      onCancel()
    }
    setShow(false)
  }, [onCancel])

  return (
    <>
      <IconButton size='small' className={buttonClassName} color="negative" icon={Delete} onClick={() => setShow(true)} loading={loading} />
      <Modal
        id="modal-basic"
        show={show}
        size="small"
        onClose={() => setShow(false)}
      >
        <ModalBasicLayout>
          <ModalHeader title={title} />
          <ModalContent>
            <Text type="text1" align="inherit" element="p">
              {description}
            </Text>
          </ModalContent>
        </ModalBasicLayout>
        <ModalFooter
          primaryButton={{
            text: "Confirm",
            onClick: handlerConfirm,
            className: 'bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
          }}
          secondaryButton={{
            text: "Cancel",
            onClick: handlerCancel,
          }}
        />
      </Modal>
    </>
  )
}
