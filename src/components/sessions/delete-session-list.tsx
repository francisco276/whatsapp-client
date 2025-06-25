import { List, Skeleton, Flex, Heading, Text } from '@vibe/core'
import { useSessions } from '@/hooks/useSession'
import { useWorkspaceId } from '@/hooks/useWorkspaceId'
import { DeleteSessionItem } from '@/components/sessions/delete-session-item'


export const DeleteSessionList = () => {
  const workspaceId = useWorkspaceId()
  const { data, isLoading, isError } = useSessions({ workspaceId })

  if (isLoading) {
    return (
      <List>
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
        <Skeleton size="h1" type="text" className="mb-2 !w-full" />
      </List>
    )
  }

  if (isError) {
    return <div>Error loading posts</div>
  }

  if (data?.sessions.length === 0) {
    return (
      <Flex align='center' justify='center' className='py-3' direction='column'>
        <Heading align='center' type='h3' weight='bold'>Sin sesiones activas</Heading>
        <Text>Aún no se ha iniciado ninguna sesión de WhatsApp.</Text>
        <Text>Conecta una cuenta para comenzar a recibir y enviar mensajes.</Text>
      </Flex>
    )
  }

  return (
    <List>
      {data?.sessions.map((session) => <DeleteSessionItem id={session.id} workspaceId={workspaceId} />)}
    </List>
  )
}
