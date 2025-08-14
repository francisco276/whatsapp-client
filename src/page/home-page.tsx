import Sessions from "@/components/layout/sessions"
import Workspace from "@/components/layout/workspace"
import Chats from "@/components/layout/chats"

export default function HomePage() {
  return (
    <Workspace>
      <Sessions>
        <Chats />
      </Sessions>
    </Workspace>
  )
}
