import { useEffect, useRef } from 'react'
import { useContext } from './useContext'
import { useWorkspaceId } from './useWorkspaceId'
import { registerMondayTarget } from '@/lib/services/monday-register'

export const useMondayRegistration = () => {
  const { data: context } = useContext()
  const workspaceId = useWorkspaceId()
  const registered = useRef(false)

  useEffect(() => {
    if (registered.current) return
    if (!workspaceId || !context?.userId || !context?.boardId) return

    registered.current = true

    registerMondayTarget({
      workspaceId,
      userId: context.userId,
      boardId: context.boardId
    }).then(() => {
      console.log('[MondayRegistration] Board target registered:', context.boardId)
    }).catch(e => {
      console.error('[MondayRegistration] Failed:', e)
      registered.current = false
    })
  }, [workspaceId, context?.userId, context?.boardId])
}
