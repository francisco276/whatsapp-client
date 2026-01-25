import { relations } from 'drizzle-orm'
import { templatesTable } from './tables'
import { workspacesTable } from '@/db/schema'

export const templateRelations = relations(templatesTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [templatesTable.workspaceId],
    references: [workspacesTable.id],
    relationName: 'workspace'
  })
}))
