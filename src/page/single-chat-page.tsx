import Workspace from "@/components/layout/workspace"
import Sessions from "@/components/layout/sessions"
import { SingleChat } from "@/components/layout/single-chat"
import MondayContex from "@/components/layout/monday-context";
import Authorization from "@/components/layout/authorization"

const SingleChatPage = () => {
  return (
    <MondayContex>
      <Authorization>
        <Workspace>
          <Sessions type="small">
            <SingleChat />
          </Sessions>
      </Workspace>
      </Authorization>
    </MondayContex>
  )
}

export default SingleChatPage
