import { Box, Button, Flex, Heading, Text } from '@vibe/core'
import { MoveArrowRight } from '@vibe/icons'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { addWorkspace } from '../lib/services/workspaces'

export const FormWorkspace = ({ workspaceId }: { workspaceId: string }) => {
  const queryClient = useQueryClient()
  const { mutate, isPending } = useMutation({
    mutationFn: addWorkspace,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['getWorkspace', workspaceId] })
    }
  })

  function onSubmit() {
    mutate({
      name: 'Espacio de trabajo',
      workspaceId
    })
  }

  return (
    <Box>
      <Flex gap={40} align='center' justify='center' direction='column'>
      <Heading className='text-8xl! text-slate-500!' type='h1' weight='bold' align='center'>Bienvenido</Heading>
      <Text className='text-3xl!' align='center'>Descubre una nueva forma de trabajar y colaborar</Text>
      <Button
        kind='primary'
        className='w-full bg-[#0DACC8]! text-white hover:bg-[#0B8AA0]!'
        rightIcon={MoveArrowRight}
        disabled={isPending}
        onClick={onSubmit}
      >
        Comenzar
      </Button>
      </Flex>
    </Box>
  )
}
