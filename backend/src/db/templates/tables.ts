import { pgTable, timestamp, varchar, text, serial, boolean } from 'drizzle-orm/pg-core'
import { workspacesTable } from '@/db/schema'

export const templatesTable = pgTable('templates', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 128 }),
  workspaceId: text('workspaceId')
    .notNull().references(() => workspacesTable.id, { onDelete: 'cascade' }),
  description: text('description'),
  message: text('message'),
  active: boolean('active').default(true).notNull(),
  createdBy: varchar('createdBy', { length: 128 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull(),
  updatedBy: varchar('updatedBy', { length: 128 }).notNull()
})
