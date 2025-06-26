import { useState, useEffect } from "react"
import { MondayApi } from "../lib/monday/api"
import type { AppContext } from "../types/monday"

type ContextProps = {
  monday: MondayApi
}

export const useContext = ({ monday }: ContextProps) => {
  const [contextState, setContextState] = useState<AppContext>({
    workspaceId: '',
    itemId: '',
    userId: '',
    boardId: '',
    accountId: '',
    idleItemId: '',
    userPunchesBoardID: '',
    version: '',
    theme: ''
  })

  const getContext = async () => {
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    const context: any = await monday.getContext()

    return context
  }


  const loadContext = async () => {
    const context = await getContext()

    setContextState((state) => {
      return {
        ...state,
        workspaceId: context?.data?.workspaceId,
        itemId: context?.data?.itemId,
        boardId: context?.data?.boardId,
        userId: context?.data?.user.id,
        theme: context?.data?.theme,
        version: `${context?.data?.appVersion.versionData.major}.${context?.data?.appVersion.versionData.minor}`,
        accountId: context?.data?.account.id
      }
    })
  }

  useEffect(() => {
    loadContext()
  }, [])

  return {
    context: contextState
  }
}
