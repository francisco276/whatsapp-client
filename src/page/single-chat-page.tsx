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
      console.log('[SingleChatPage] Settings received:', data.data)
      if (data.data.phoneColumnId && typeof data.data.phoneColumnId === 'object') {
        const keys = Object.keys(data.data.phoneColumnId)
        if (keys.length > 0) {
          const phoneColumnId = keys[0]
          console.log('[SingleChatPage] Phone column ID:', phoneColumnId)
          setState(value => ({ ...value, error: '', phoneColumnId }))
        } else {
          setState(value => ({ ...value, error: ERROR_PHONE_COLUMN_CONFIGURATION }))
        }
      } else {
        console.log('[SingleChatPage] No phone column configured')
        setState(value => ({ ...value, error: ERROR_PHONE_COLUMN_CONFIGURATION }))
      }
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
