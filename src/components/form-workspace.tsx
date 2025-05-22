import { Button, Flex, TextField } from '@vibe/core'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addWorkspace } from '../lib/services/workspaces'

interface FormElements extends HTMLFormControlsCollection {
  name: HTMLInputElement
}
interface WorkspaceFormElement extends HTMLFormElement {
  readonly elements: FormElements
}

export const FormWorkspace = ({ workspaceId }: { workspaceId: string }) => {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: addWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getWorkspace', workspaceId] })
    }
  })

  function onSubmit(e: React.FormEvent<WorkspaceFormElement>) {
    e.preventDefault()
    const form = e.currentTarget.elements

    mutate({
      name: form.name.value,
      workspaceId
    })
  }


  return <>
    <form onSubmit={onSubmit}>
      <Flex
        direction='column'
        gap={20}
      >
        <TextField
          id='name'
          placeholder='Nombre del espacio'
          title='Nombre del espacio'
          required
          size='medium'
          controlled={false}
        />
        <Button type='submit' disabled={isPending} >Crear un nuevo espacio</Button>
      </Flex>
    </form>

  </>
}
