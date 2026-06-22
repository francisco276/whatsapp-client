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

  public static async createWorkspace ({ id, name, userId, grantAdmin = true }: { id: string, name: string, userId: string, grantAdmin?: boolean }): Promise<Workspace> {
    const [workspaceDb] = await db.insert(workspacesTable).values({ id, name }).returning()

    // Only grant admin on creation when explicitly allowed (e.g. the `add` flow). The `join`
    // flow passes grantAdmin: false and decides admin via the monday isAdmin flag instead,
    // so simply opening the app can never make a non-admin the owner of the workspace.
    if (grantAdmin) {
      await db
        .insert(authorizationTable)
        .values({ userId, workspaceId: id, role: 'admin' })
        .onConflictDoNothing({ target: [authorizationTable.workspaceId, authorizationTable.userId] })
    }

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
