import { pgTable, timestamp, varchar, text, serial, unique, uniqueIndex, boolean, integer, bigint, jsonb, customType, index, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { UserPreferencesConfig } from '@/types/preferences'
import { templatesTable } from './templates'

export const workspacesTable = pgTable('workspaces', {
  id: text('id').notNull().primaryKey(),
  name: varchar('name', { length: 500 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
})

export const sessionTable = pgTable('sessions', {
  pkId: serial('pkId').primaryKey(),
  sessionId: varchar('sessionId', { length: 128 }).notNull(),
  workspaceId: text('workspaceId')
    .notNull().references(() => workspacesTable.id, { onDelete: 'cascade' }),
  id: varchar('id', { length: 255 }).notNull(),
  data: text('data').notNull(),
  isSynced: boolean('sync').notNull().default(true),
  createdBy: varchar('createdBy', { length: 128 }).notNull()
}, (table) => [
  unique('unique_id_per_session_id').on(table.sessionId, table.id),
  index('session_id_index').on(table.sessionId)
])

export const workspacesRelations = relations(workspacesTable, ({ many }) => ({
  sessions: many(sessionTable, {
    relationName: 'workspace_sessions'
  }),
  authorizations: many(authorizationTable),
  preferences: many(preferencesTable),
  templates: many(templatesTable)
}))

export const sessionsRelations = relations(sessionTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [sessionTable.workspaceId],
    references: [workspacesTable.id],
    relationName: 'workspace_sessions'
  })
}))

export const binary = customType<{
  data: Uint8Array | null
  driverData: Buffer | null
}>({
  dataType () {
    return 'bytea'
  },
  fromDriver (value: unknown): Uint8Array | null {
    if (value === null) {
      return null
    }
    // Add type checking to ensure value is Buffer when not null
    if (!(value instanceof Buffer)) {
      throw new Error('Expected Buffer from database')
    }
    return new Uint8Array(value)
  },
  toDriver (value: Uint8Array | null): Buffer | null {
    if (value === null) {
      return null
    }
    return Buffer.from(value)
  }
})

export const chatTable = pgTable('chat', {
  pkId: serial('pkId').primaryKey(),
  sessionId: varchar('sessionId', { length: 128 }).notNull(),
  workspaceId: text('workspaceId').notNull(),
  archived: boolean('archived'),
  contactPrimaryIdentityKey: binary('contactPrimaryIdentityKey'),
  conversationTimestamp: bigint('conversationTimestamp', { mode: 'number' }),
  createdAt: bigint('createdAt', { mode: 'number' }),
  createdBy: varchar('createdBy', { length: 128 }),
  description: text('description'),
  disappearingMode: jsonb('disappearingMode'),
  displayName: varchar('displayName', { length: 128 }),
  endOfHistoryTransfer: boolean('endOfHistoryTransfer'),
  endOfHistoryTransferType: integer('endOfHistoryTransferType'),
  ephemeralExpiration: integer('ephemeralExpiration'),
  ephemeralSettingTimestamp: bigint('ephemeralSettingTimestamp', { mode: 'number' }),
  id: varchar('id', { length: 128 }).notNull(),
  isDefaultSubgroup: boolean('isDefaultSubgroup'),
  isParentGroup: boolean('isParentGroup'),
  lastMsgTimestamp: bigint('lastMsgTimestamp', { mode: 'number' }),
  lidJid: varchar('lidJid', { length: 128 }),
  markedAsUnread: boolean('markedAsUnread'),
  mediaVisibility: integer('mediaVisibility'),
  messages: jsonb('messages'),
  muteEndTime: bigint('muteEndTime', { mode: 'number' }),
  name: varchar('name', { length: 128 }),
  newJid: varchar('newJid', { length: 128 }),
  notSpam: boolean('notSpam'),
  oldJid: varchar('oldJid', { length: 128 }),
  pHash: varchar('pHash', { length: 128 }),
  parentGroupId: varchar('parentGroupId', { length: 128 }),
  participant: jsonb('participant'),
  pinned: bigint('pinned', { mode: 'number' }),
  pnJid: varchar('pnJid', { length: 128 }),
  pnhDuplicateLidThread: boolean('pnhDuplicateLidThread'),
  readOnly: boolean('readOnly'),
  shareOwnPn: boolean('shareOwnPn'),
  support: boolean('support'),
  suspended: boolean('suspended'),
  tcToken: binary('tcToken'),
  tcTokenSenderTimestamp: bigint('tcTokenSenderTimestamp', { mode: 'number' }),
  tcTokenTimestamp: bigint('tcTokenTimestamp', { mode: 'number' }),
  terminated: boolean('terminated'),
  unreadCount: integer('unreadCount'),
  unreadMentionCount: integer('unreadMentionCount'),
  wallpaper: jsonb('wallpaper'),
  lastMessageRecvTimestamp: integer('lastMessageRecvTimestamp'),
  commentsCount: integer('commentsCount')
}, (table) => [
  uniqueIndex('unique_chat_id_per_session_id').on(table.sessionId, table.id),
  index('chat_session_id_index').on(table.sessionId)
])

export const contactTable = pgTable('contacts', {
  pkId: serial('pkId').primaryKey(),
  sessionId: varchar('sessionId', { length: 128 }).notNull(),
  workspaceId: text('workspaceId').notNull(),
  id: varchar('id', { length: 128 }).notNull(),
  lid: varchar('lid', { length: 128 }),
  phoneNumber: varchar('phoneNumber', { length: 32 }),
  name: varchar('name', { length: 128 }),
  notify: varchar('notify', { length: 128 }),
  verifiedName: varchar('verifiedName', { length: 128 }),
  imgUrl: varchar('imgUrl', { length: 128 }),
  status: varchar('status', { length: 128 })
}, (table) => [
  uniqueIndex('unique_contact_id_per_session_id').on(table.sessionId, table.id),
  index('contact_session_id_index').on(table.sessionId)
])

export const messagesTable = pgTable('messages', {
  pkId: integer('pkId').primaryKey().generatedByDefaultAsIdentity(),
  sessionId: varchar('sessionId', { length: 128 }).notNull(),
  workspaceId: varchar('workspaceId', { length: 128 }).notNull(),
  remoteJid: varchar('remoteJid', { length: 128 }).notNull(),
  id: varchar('id', { length: 128 }).notNull(),
  agentId: varchar('agentId', { length: 128 }),
  bizPrivacyStatus: integer('bizPrivacyStatus'),
  broadcast: boolean('broadcast'),
  clearMedia: boolean('clearMedia'),
  duration: integer('duration'),
  ephemeralDuration: integer('ephemeralDuration'),
  ephemeralOffToOn: boolean('ephemeralOffToOn'),
  ephemeralOutOfSync: boolean('ephemeralOutOfSync'),
  ephemeralStartTimestamp: bigint('ephemeralStartTimestamp', { mode: 'number' }),
  finalLiveLocation: jsonb('finalLiveLocation'),
  futureproofData: binary('futureproofData'),
  ignore: boolean('ignore'),
  keepInChat: jsonb('keepInChat'),
  key: jsonb('key').notNull().default({}),
  labels: jsonb('labels'),
  mediaCiphertextSha256: binary('mediaCiphertextSha256'),
  mediaData: jsonb('mediaData'),
  message: jsonb('message'),
  messageC2STimestamp: bigint('messageC2STimestamp', { mode: 'number' }),
  messageSecret: binary('messageSecret'),
  messageStubParameters: jsonb('messageStubParameters'),
  messageStubType: integer('messageStubType'),
  messageTimestamp: bigint('messageTimestamp', { mode: 'number' }),
  multicast: boolean('multicast'),
  originalSelfAuthorUserJidString: varchar('originalSelfAuthorUserJidString', { length: 128 }),
  participant: varchar('participant', { length: 128 }),
  paymentInfo: jsonb('paymentInfo'),
  photoChange: jsonb('photoChange'),
  pollAdditionalMetadata: jsonb('pollAdditionalMetadata'),
  pollUpdates: jsonb('pollUpdates'),
  pushName: varchar('pushName', { length: 128 }),
  quotedPaymentInfo: jsonb('quotedPaymentInfo'),
  quotedStickerData: jsonb('quotedStickerData'),
  reactions: jsonb('reactions'),
  revokeMessageTimestamp: bigint('revokeMessageTimestamp', { mode: 'number' }),
  starred: boolean('starred'),
  status: integer('status'),
  statusAlreadyViewed: boolean('statusAlreadyViewed'),
  statusPsa: jsonb('statusPsa'),
  urlNumber: boolean('urlNumber'),
  urlText: boolean('urlText'),
  userReceipt: jsonb('userReceipt'),
  verifiedBizName: varchar('verifiedBizName', { length: 128 }),
  eventResponses: jsonb('eventResponses'),
  pinInChat: jsonb('pinInChat'),
  reportingTokenInfo: jsonb('reportingTokenInfo')
}, (table) => [
  uniqueIndex('unique_contact_id_per_session_id_and_workspace_id').on(table.sessionId, table.workspaceId, table.remoteJid, table.id)
])

export const userRoleEnum = pgEnum('user_role', ['admin', 'user', 'reader'])

export const authorizationTable = pgTable('authorization', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  workspaceId: text('work').notNull().references(() => workspacesTable.id, { onDelete: 'cascade' }),
  role: userRoleEnum('role').notNull().default('user')
}, (table) => [
  unique('unique_user_on_workspace').on(table.workspaceId, table.userId)
])

export const auhothorizationRelations = relations(authorizationTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [authorizationTable.workspaceId],
    references: [workspacesTable.id]
  })
}))

export const preferencesTable = pgTable('preferences', {
  id: serial('id').primaryKey(),
  userId: text('userId').notNull(),
  workspaceId: text('workspaceId').notNull()
    .notNull().references(() => workspacesTable.id, { onDelete: 'cascade' }),
  config: jsonb('config')
    .$type<UserPreferencesConfig>()
    .notNull()
    .default({
      notifications: {
        onMessageSend: true
      },
      privacy: {
        doNotSyncPreviousChats: false
      }
    })
})

export const preferencesRelations = relations(preferencesTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [preferencesTable.workspaceId],
    references: [workspacesTable.id]
  })
}))

export const sessionAccessTable = pgTable('session_access', {
  id: serial('id').primaryKey(),
  sessionId: varchar('sessionId', { length: 128 }).notNull(),
  workspaceId: text('workspaceId').notNull()
    .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  userId: text('userId').notNull(),
  grantedBy: text('grantedBy').notNull()
}, (table) => [
  unique('session_acess_table').on(table.workspaceId, table.userId, table.sessionId)
])

export const sessionAccessRelations = relations(sessionAccessTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [sessionAccessTable.workspaceId],
    references: [workspacesTable.id]
  })
}))

export const messageCountersTable = pgTable('message_counters', {
  id: serial('id').primaryKey(),
  workspaceId: text('workspaceId').notNull()
    .references(() => workspacesTable.id, { onDelete: 'cascade' }),
  year: integer('year').notNull(),
  month: integer('month').notNull(),
  sentCount: integer('sentCount').notNull().default(0),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().notNull()
}, (table) => [
  unique('unique_counter_per_workspace_month').on(table.workspaceId, table.year, table.month)
])

export const messageCountersRelations = relations(messageCountersTable, ({ one }) => ({
  workspace: one(workspacesTable, {
    fields: [messageCountersTable.workspaceId],
    references: [workspacesTable.id]
  })
}))

export * from './templates'
