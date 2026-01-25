import { useState, useEffect, useMemo } from "react"
import { MondayApi } from '@/lib/monday/api'
import { ERROR_PHONE_COLUMN_CONFIGURATION } from "@/config/errors"
import { Error } from "@/components/error"
import { SingleSettings } from "@/types/monday"
import Workspace from "@/components/layout/workspace"
import Sessions from "@/components/layout/sessions"
import { SingleChat } from "@/components/layout/single-chat"
import MondayContex from "@/components/layout/monday-context";
import Authorization from "@/components/layout/authorization"

const SingleChatPage = () => {
  const [state, setState] = useState({
    phoneColumnId: '',
    error: ''
  })

  const monday = useMemo(() => new MondayApi(), [])

  useEffect(() => {
    monday.listen<SingleSettings>('settings', (data) => {
      const phoneColumnData = data.data?.phoneColumnId
      if (phoneColumnData && typeof phoneColumnData === 'object') {
        const keys = Object.keys(phoneColumnData)
        if (keys.length > 0) {
          setState(value => ({ ...value, error: '', phoneColumnId: keys[0] }))
          return
        }
      }
      setState(value => ({ ...value, error: ERROR_PHONE_COLUMN_CONFIGURATION }))
    })
  }, [monday])

  if (state.error) {
    return <Error errorMessage={state.error} />
  }

  return (
    <MondayContex>
      <Authorization>
        <Workspace>
          <Sessions type="small">
            <SingleChat phoneColumnId={state.phoneColumnId} />
          </Sessions>
      </Workspace>
      </Authorization>
    </MondayContex>

  )
}

export default SingleChatPage
