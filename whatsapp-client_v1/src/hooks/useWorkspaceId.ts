import { useContext } from 'react'
import { WorkspaceContext } from '@/components/providers/workspace/workspace-context'

export const useWorkspaceId = () => {
  const context = useContext(WorkspaceContext)
  if (context === undefined) {
    throw new Error('useWorkspaceId must be used within a WorkspaceProvider')
  }
  return context
}
