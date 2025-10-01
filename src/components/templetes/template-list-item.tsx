import { Flex, Label, IconButton, TableCell } from "@vibe/core"
import { Duplicate } from '@vibe/icons'
import { DeleteButtonModal } from "../delete/delete-button-modal"
import { EditButtonModal } from "../delete/edit-button-modal"
import { TemplateForm } from "./template-form"
import { TemplateItem } from "@/types/templates"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as TemplateService from '@/lib/services/templates'

export const TemplateListItem = ({ item }: { item: TemplateItem }) => {
  const queryClient = useQueryClient()
  const { mutate: remove } = useMutation({
    mutationFn: TemplateService.remove,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [item.workspaceId, 'TemplatesTableQuery'] })
    }
  })
  const { mutate: duplicate } = useMutation({
    mutationFn: TemplateService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [item.workspaceId, 'TemplatesTableQuery'] })
    }
  })

  const hanlderDuplicate = () => {
    duplicate({
      name: item.name,
      workspaceId: item.workspaceId,
      description: item.description,
      message: item.message,
      active: item.active
    })
  }

  const hanlderRemove = () => {
    remove({ id: item.id })
  }

  return (
    <>
      <TableCell>{item.name}</TableCell>
      <TableCell>{item.description}</TableCell>
      <TableCell>{item.message}</TableCell>
      <TableCell>{item.active ? <Label id="colors-positive-fill" text="Activo" color="positive" /> : <Label id="colors-negative-fill" text="Inactivo" color="negative" />}</TableCell>
      <TableCell>{item.updatedAt}</TableCell>
      <TableCell>
        <Flex>
          <EditButtonModal
            title="Edita tu template"
            description="Edita libremente, siempre podrás modificarlo de nuevo."
          >
            <TemplateForm
              mode="edit"
              submitButton={{
                text: 'Actualizar'
              }}
              data={item}
            />
          </EditButtonModal>
          <IconButton 
            icon={Duplicate}
            size="small"
            onClick={hanlderDuplicate}
          />
          <DeleteButtonModal 
            title="¿Seguro que quieres borrar el template?" 
            description="No te preocupes, siempre puedes crear uno nuevo más adelante."
            onConfirm={hanlderRemove}
          />
        </Flex>
      </TableCell>
    </>
  )
}
