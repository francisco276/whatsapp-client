import { useForm } from 'react-hook-form'
import { TextField, TextArea, Flex, Button, Toggle, Text } from '@vibe/core'
import { CreateTemplate, TemplateItem, UpdateTemplate } from '@/types/templates'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import * as TemplateService from '@/lib/services/templates'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'

interface TemplateFormProps {
  submitButton: {
    text: string
  },
  cancelButton?: {
    text: string
    onClick: () => void
  }
  onDonde?: () => void
  mode?: 'edit' | 'create',
  data?: TemplateItem
}

type FormData = CreateTemplate | UpdateTemplate

export const TemplateForm = ({ cancelButton, submitButton, mode = 'create', onDonde, data }: TemplateFormProps) => {
  const workspaceId = useWorkspaceId()
  const queryClient = useQueryClient()

  const { mutate, isPending: isLoading } = useMutation({
    mutationFn: mode === 'create' ? TemplateService.add : TemplateService.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [workspaceId, 'TemplatesTableQuery'] })
      if (typeof onDonde === 'function') {
        onDonde()
      }
    },
    onError: () => {
    }
  })

  const form = useForm<FormData>({
    defaultValues: {
      name: data?.name || '',
      description: data?.description || '',
      message: data?.message || '',
      workspaceId: data?.workspaceId || workspaceId,
      active: true,
      ...((mode === 'edit' && data) && { templateId: data.id, active: data.active })
    }
  })

  function hanldlerSubmit(payload: FormData) {
    if (mode === 'create') {
      mutate({ ...payload, templateId: '' })
    }

    if (mode === 'edit' && data?.id) {
      const updateData: UpdateTemplate = {
        ...payload,
        templateId: data.id,
      }

      mutate(updateData)
    }
  }

  return (
    <form
      id='template-form'
      onSubmit={form.handleSubmit(hanldlerSubmit)}
    >
      <Flex
        align="stretch"
        direction="column"
        gap="large"
      >
        <TextField
          id='template-name'
          inputAriaLabel='Nombre de la plantilla'
          title='Nombre de la plantilla'
          placeholder='Nombre de la plantilla'
          size='medium'
          onChange={(value) => form.setValue('name', value)}
          validation={form.formState.errors.name && ({ status: 'error', text: form.formState.errors.name.message })}
          value={form.getValues('name')}
        />
        <TextField
          id='template-description'
          inputAriaLabel='Descripción de la plantilla'
          title='Descripción de la plantilla'
          placeholder='Descripción de la plantilla'
          size='medium'
          onChange={(value) => form.setValue('description', value)}
          validation={form.formState.errors.description && ({ status: 'error', text: form.formState.errors.description.message })}
          value={form.getValues('description')}
        />
        <TextArea
          id="message"
          aria-label="Mensaje"
          size="large"
          label="Mensaje"
          helpText={form.formState.errors.message?.message || '' }
          error={!!form.formState.errors.message}
          {...form.register('message')}
        />
      </Flex>
      <Flex gap="medium" justify='space-between' className='py-3'>
        <Text id="active-template-label">Activar Template</Text>
        <Toggle id="active-template-toggle" ariaLabel="Activar Template" onOverrideText='' offOverrideText='' value={form.getValues('active').toString()} onChange={(value) => form.setValue('active', value)} />
      </Flex>
      <Flex className='mt-5' gap={10} align='center' justify='end'>
        {cancelButton && <Button onClick={cancelButton.onClick} kind='tertiary' disabled={isLoading}>{cancelButton.text}</Button> }
        <Button
          className='bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
          type='submit'
          disabled={isLoading}
        >
          {submitButton.text}
        </Button>
      </Flex>
    </form>
  )
}
