import { Text, IconButton, useSwitch } from '@vibe/core'
import { Edit } from '@vibe/icons'
import { Modal, ModalHeader, ModalContent, ModalBasicLayout } from '@vibe/core/next'
import { ReactNode, cloneElement, type ReactElement } from 'react'

type EditButtonModalProps = {
  title: string,
  description: string
  buttonClassName?: string
  children: ReactNode
}

type ChildrenProps = { onDone?: () => void }

export const EditButtonModal = ({ title, description, buttonClassName, children }: EditButtonModalProps) => {
  const { isChecked, onChange } = useSwitch()
  const childrenWithDone = cloneElement(children as ReactElement<ChildrenProps>, { onDone: onChange })

  return (
    <>
      <IconButton size='small' className={buttonClassName} icon={Edit} onClick={onChange} />
      <Modal
        id="modal-basic"
        show={isChecked}
        size="small"
        onClose={onChange}
      >
        <ModalBasicLayout>
          <ModalHeader
            title={title} />
          <ModalContent>
            <Text type="text1" align="inherit" element="p">
              {description}
            </Text>
          </ModalContent>
        </ModalBasicLayout>
      </Modal>
      <Modal
        id="modal-basic-small"
        show={isChecked}
        size="medium"
        onClose={onChange}
        alertModal
      >
        <ModalBasicLayout>
          <ModalHeader
            title={title}
            description={description}
          />
          <ModalContent>
            {childrenWithDone}
          </ModalContent>
        </ModalBasicLayout>
      </Modal>
    </>
  )
}
