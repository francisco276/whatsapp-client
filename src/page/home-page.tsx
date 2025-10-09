import Sessions from "@/components/layout/sessions"
import Workspace from "@/components/layout/workspace"
import Chats from "@/components/layout/chats"
import Authorization from "@/components/layout/authorization"
import MondayContex from "@/components/layout/monday-context";

export default function HomePage() {
  return (
    <MondayContex>
      <Authorization>
        <Workspace>
          <Sessions>
            <Chats />
          </Sessions>
        </Workspace>
      </Authorization>
    </MondayContex>
  )
}
