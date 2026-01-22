import { WorkspaceContext } from './workspace-context'

type WorkspaceProviderProps = {
  children: React.ReactNode
  workspaceId: string
}

export const WorkspaceProvider = ({ children, workspaceId }: WorkspaceProviderProps) => {
  return (
    <WorkspaceContext.Provider value={workspaceId}>
      {children}
    </WorkspaceContext.Provider>
  )
}
