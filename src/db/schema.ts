import { pgTable, pgEnum, uuid, varchar, text, boolean, integer, real, timestamp, jsonb, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { InferSelectModel, InferInsertModel } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'viewer']);
export const dealStatusEnum = pgEnum('deal_status', ['draft', 'open', 'negotiating', 'locked', 'committed']);
export const flowStatusEnum = pgEnum('flow_status', ['draft', 'published', 'archived']);
export const auditActionEnum = pgEnum('audit_action', [
  'user.register', 'user.login', 'user.logout', 'user.role_change',
  'flow.create', 'flow.update', 'flow.publish', 'flow.delete', 'flow.version',
  'deal.create', 'deal.status_change', 'deal.participant_add', 'deal.participant_remove',
  'room.create', 'room.join', 'room.leave',
  'message.send', 'file.upload'
]);
export const joinRequestStatusEnum = pgEnum('join_request_status', ['pending', 'approved', 'rejected']);

// Tables
export const organizations = pgTable('organizations', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  domain: varchar('domain', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  partyId: varchar('party_id', { length: 195 }).notNull().unique(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }),
  role: userRoleEnum('role').notNull().default('viewer'),
  avatarUrl: varchar('avatar_url', { length: 512 }),
  isActive: boolean('is_active').default(true),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxUsersPartyId: index('idx_users_party_id').on(table.partyId),
  idxUsersOrgId: index('idx_users_org_id').on(table.orgId)
}));

export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  tokenHash: varchar('token_hash', { length: 255 }).notNull(),
  tokenFamily: uuid('token_family').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxRefreshTokensUserId: index('idx_refresh_tokens_user_id').on(table.userId),
  idxRefreshTokensFamily: index('idx_refresh_tokens_family').on(table.tokenFamily)
}));

export const flows = pgTable('flows', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: flowStatusEnum('status').default('draft'),
  isTemplate: boolean('is_template').default(false),
  isPublic: boolean('is_public').default(false),
  workflowType: varchar('workflow_type', { length: 64 }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedBy: uuid('updated_by').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxFlowsOrgStatusTemplate: index('idx_flows_org_status_template').on(table.orgId, table.status, table.isTemplate)
}));

export const flowVersions = pgTable('flow_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  version: integer('version').notNull().default(1),
  nodes: jsonb('nodes').notNull().default('[]'),
  edges: jsonb('edges').notNull().default('[]'),
  viewport: jsonb('viewport'),
  metadata: jsonb('metadata'),
  snapshotName: varchar('snapshot_name', { length: 255 }),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueFlowVersion: uniqueIndex('unique_flow_version').on(table.flowId, table.version),
  idxFlowVersionsFlowId: index('idx_flow_versions_flow_id').on(table.flowId)
}));

export const flowParticipants = pgTable('flow_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  participantId: varchar('participant_id', { length: 64 }).notNull(),
  nodeId: varchar('node_id', { length: 128 }),
  positionX: real('position_x'),
  positionY: real('position_y'),
  addedBy: uuid('added_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueFlowParticipant: uniqueIndex('unique_flow_participant').on(table.flowId, table.participantId)
}));

export const deals = pgTable('deals', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').references(() => flows.id),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  status: dealStatusEnum('status').default('draft'),
  volume: varchar('volume', { length: 64 }),
  metadata: jsonb('metadata'),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxDealsOrgStatusFlow: index('idx_deals_org_status_flow').on(table.orgId, table.status, table.flowId)
}));

export const dealParticipants = pgTable('deal_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  role: userRoleEnum('role').default('viewer'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow()
}, (table) => ({
  uniqueDealParticipant: uniqueIndex('unique_deal_participant').on(table.dealId, table.userId)
}));

export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  dealId: uuid('deal_id').notNull().references(() => deals.id),
  threadId: uuid('thread_id'),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  content: text('content').notNull(),
  contentType: varchar('content_type', { length: 32 }).default('text'),
  fileUrl: varchar('file_url', { length: 512 }),
  fileName: varchar('file_name', { length: 255 }),
  fileSize: integer('file_size'),
  isEdited: boolean('is_edited').default(false),
  editedAt: timestamp('edited_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxMessagesDealThreadCreated: index('idx_messages_deal_thread_created').on(table.dealId, table.threadId, table.createdAt)
}));

export const joinRequests = pgTable('join_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id),
  requesterId: uuid('requester_id').notNull().references(() => users.id),
  message: text('message'),
  status: joinRequestStatusEnum('status').default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueFlowRequester: uniqueIndex('unique_flow_requester').on(table.flowId, table.requesterId)
}));

export const auditLog = pgTable('audit_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  orgId: uuid('org_id').references(() => organizations.id),
  action: auditActionEnum('action').notNull(),
  resourceType: varchar('resource_type', { length: 64 }),
  resourceId: uuid('resource_id'),
  metadata: jsonb('metadata'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxAuditLogUserAction: index('idx_audit_log_user_action').on(table.userId, table.action),
  idxAuditLogResourceType: index('idx_audit_log_resource_type').on(table.resourceType, table.resourceId),
  idxAuditLogCreatedAt: index('idx_audit_log_created_at').on(table.createdAt)
}));

export const activeSessions = pgTable('active_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  dealId: uuid('deal_id').references(() => deals.id),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

export const nodeApiConfigs = pgTable('node_api_configs', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  endpointUrl: varchar('endpoint_url', { length: 512 }).notNull(),
  apiKeyHash: varchar('api_key_hash', { length: 255 }),
  label: varchar('label', { length: 255 }),
  isActive: boolean('is_active').default(true),
  lastHealthAt: timestamp('last_health_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Type exports
export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type RefreshToken = InferSelectModel<typeof refreshTokens>;
export type NewRefreshToken = InferInsertModel<typeof refreshTokens>;

export type Flow = InferSelectModel<typeof flows>;
export type NewFlow = InferInsertModel<typeof flows>;

export type FlowVersion = InferSelectModel<typeof flowVersions>;
export type NewFlowVersion = InferInsertModel<typeof flowVersions>;

export type FlowParticipant = InferSelectModel<typeof flowParticipants>;
export type NewFlowParticipant = InferInsertModel<typeof flowParticipants>;

export type Deal = InferSelectModel<typeof deals>;
export type NewDeal = InferInsertModel<typeof deals>;

export type DealParticipant = InferSelectModel<typeof dealParticipants>;
export type NewDealParticipant = InferInsertModel<typeof dealParticipants>;

export type Message = InferSelectModel<typeof messages>;
export type NewMessage = InferInsertModel<typeof messages>;

export type JoinRequest = InferSelectModel<typeof joinRequests>;
export type NewJoinRequest = InferInsertModel<typeof joinRequests>;

export type AuditLog = InferSelectModel<typeof auditLog>;
export type NewAuditLog = InferInsertModel<typeof auditLog>;

export type ActiveSession = InferSelectModel<typeof activeSessions>;
export type NewActiveSession = InferInsertModel<typeof activeSessions>;

export type NodeApiConfig = InferSelectModel<typeof nodeApiConfigs>;
export type NewNodeApiConfig = InferInsertModel<typeof nodeApiConfigs>;