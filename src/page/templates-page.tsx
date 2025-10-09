import Workspace from "@/components/layout/workspace"
import { TemplateForm } from "@/components/templetes/template-form"
import { Heading, Box, Text, Flex, Button, useSwitch } from "@vibe/core"
import { Modal, ModalHeader, ModalContent, ModalBasicLayout } from '@vibe/core/next'
import { Add } from '@vibe/icons'
import { Templates } from "@/components/layout/templates"
import Authorization from "@/components/layout/authorization"
import MondayContex from "@/components/layout/monday-context";

export default function TemplatesPage() {
  const { isChecked, onChange } = useSwitch()

  return (
    <MondayContex>
      <Authorization>
        <Workspace>
              <Box padding="xxxl">
                <Box>
                  <Heading className="font-medium! text-slate-700!">Plantillas de Mensajes</Heading>
                  <Text className="text-sm! text-slate-500!">Gestiona y organiza todas tus plantillas de mensajes</Text>
                </Box>
                <Box>
                  <Flex justify="end">
                    <Button
                      kind='primary'
                      leftIcon={Add}
                      className='bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
                      onClick={onChange}
                    >
                      Nueva plantilla
                    </Button>
                  </Flex>
                </Box>
                <Box paddingY="xl">
                  <Templates />
                </Box>
              <Modal
                id="modal-basic-small"
                show={isChecked}
                size="medium"
                onClose={onChange}
                alertModal
              >
                <ModalBasicLayout>
                  <ModalHeader
                    title="Crear nueva plantilla"
                    description="Complete el formulario para crear una nueva plantilla"
                  />
                  <ModalContent>
                      <TemplateForm
                        cancelButton={{
                          text: 'Cancelar',
                          onClick: onChange
                        }}
                        submitButton={{
                          text: 'Crear template'
                        }}
                        onDonde={onChange}
                      />
                  </ModalContent>
                </ModalBasicLayout>
              </Modal>
              </Box>
            </Workspace>
      </Authorization>
    </MondayContex>
  )
}
