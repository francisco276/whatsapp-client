import { eq } from 'drizzle-orm'
import { db } from '@/db'
import { authorizationTable, workspacesTable } from '@/db/schema'
import { Workspace } from '@/services/Workspace'
import { NotFoundError } from '@/errors/errors'

export class WorkspaceManager {
  private static workspaces: Map<string, Workspace> = new Map<string, Workspace>()

  constructor () {
    this.init().catch(console.error)
  }

  private async init (): Promise<void> {
    const workspaces = await db.select().from(workspacesTable)

    for (const workspace of workspaces) {
      WorkspaceManager.workspaces.set(workspace.id, new Workspace(workspace))
    }
  }

  public static async createWorkspace ({ id, name, userId }: { id: string, name: string, userId: string }): Promise<Workspace> {
    const [workspaceDb] = await db.insert(workspacesTable).values({ id, name }).returning()
    await db.insert(authorizationTable).values({ userId, workspaceId: id, role: 'admin' })

    const workspace = new Workspace(workspaceDb)

    WorkspaceManager.workspaces.set(id, workspace)

    return workspace
  }

  public static async getWorkspace (id: string): Promise<Workspace> {
    const workspaceStore = WorkspaceManager.workspaces.get(id)

    if (workspaceStore !== null && workspaceStore !== undefined) return workspaceStore

    const [workspaceDb] = await db.select().from(workspacesTable).where(eq(workspacesTable.id, id))

    if (workspaceDb === undefined) {
      throw new NotFoundError('Workspace not found')
    }

    const workspace = new Workspace(workspaceDb)

    WorkspaceManager.workspaces.set(id, workspace)

    return workspace
  }

  public static async deleteWorkspace (id: string): Promise<boolean> {
    const deleted = WorkspaceManager.workspaces.delete(id)
    if (deleted) {
      await db.delete(workspacesTable).where(eq(workspacesTable.id, id))
    }

    return deleted
  }

  public static exist (id: string): boolean {
    return WorkspaceManager.workspaces.has(id)
  }
}
