import { useDeleteSession, useSessionInformation } from "@/hooks/useSession"
import { ListItem, ListItemAvatar, Skeleton } from "@vibe/core"
import { DeleteButtonModal } from "../delete/delete-button-modal"
import { useContext } from "react"
import { SessionContext } from "../providers/session/session-context"
import { cn } from "@/utils/utils"

export const DeleteSessionItem = ({ id, workspaceId }: { id: string, workspaceId: string }) => {
  const { session, setSession } = useContext(SessionContext)
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

  function handlerClick(event: React.MouseEvent | React.KeyboardEvent) {
    if (event instanceof MouseEvent) {
      event.preventDefault()
    }
    setSession(id)
  }

  const isSelected = session === id

  return (
    <ListItem size="large" className={cn('!px-0 !cursor-default')} selected={isSelected} component="div" onClick={handlerClick}>
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
