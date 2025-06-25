import { useDeleteSession, useSessionInformation } from "@/hooks/useSession"
import { ListItem, ListItemAvatar, Skeleton } from "@vibe/core"
import { DeleteButtonModal } from "../delete/delete-button-modal"

export const DeleteSessionItem = ({ id, workspaceId }: { id: string, workspaceId: string }) => {
  const { data, isError, isLoading } = useSessionInformation({ workspaceId, sessionId: id })
  const { mutate, isPending } = useDeleteSession()

  if (isLoading) {
    return <Skeleton size="h1" type="text" className="mb-2 !w-full" />
  }

  if (isError) {
    return <div>Error loading info</div>
  }

  function handleDelete() {
    mutate({ workspaceId, sessionId: id })
  }

  return (
    <ListItem size="large" className="!px-0 !bg-transparent !cursor-default" component="div">
      <ListItemAvatar src={data?.user.image} />
      {data?.user.name}
      <DeleteButtonModal
        buttonClassName="ml-auto"
        title="Seguro que deseas eliminar esta sesion?"
        description="Esta accion no se puede deshacer y eliminara la sesion de forma permanente."
        onConfirm={() => handleDelete()}
        loading={isPending}
      />
    </ListItem>
  )
}
