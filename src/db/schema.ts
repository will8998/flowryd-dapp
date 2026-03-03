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
  'message.send', 'file.upload',
  'subscription.create', 'subscription.cancel', 'subscription.renew',
  'provider.apply', 'provider.approve', 'provider.reject'
]);
export const joinRequestStatusEnum = pgEnum('join_request_status', ['pending', 'approved', 'rejected']);
export const subscriptionStatusEnum = pgEnum('subscription_status', ['pending', 'trial', 'active', 'past_due', 'cancelled', 'expired']);
export const planTierEnum = pgEnum('plan_tier', ['discover', 'navigate', 'activate']);
export const providerStatusEnum = pgEnum('provider_status', ['pending', 'active', 'inactive']);
export const providerCategoryEnum = pgEnum('provider_category', ['strategy', 'development', 'creative']);
export const participantVerificationEnum = pgEnum('participant_verification', ['unclaimed', 'pending', 'approved', 'verified', 'rejected']);
export const participantCriticalityEnum = pgEnum('participant_criticality', ['critical', 'required', 'optional']);
export const cantonFlowStatusEnum = pgEnum('canton_flow_status', ['proven', 'design', 'active', 'planned']);

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
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  isFeatured: boolean('is_featured').default(false),
  featuredHeadline: varchar('featured_headline', { length: 500 }),
  featuredSource: varchar('featured_source', { length: 500 }),
  // Liz's architecture: link user flow to a Canton Flow blueprint
  cantonFlowId: varchar('canton_flow_id', { length: 32 }), // FK to canton_flows (null for custom flows)
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
  // Liz's architecture: template step assignment
  stepNumber: integer('step_number'), // which step in the canton flow
  templateName: varchar('template_name', { length: 255 }), // which template role this participant fills
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

export const plans = pgTable('plans', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  tier: planTierEnum('tier').notNull(),
  priceAmount: integer('price_amount').notNull(), // in cents
  priceCurrency: varchar('price_currency', { length: 10 }).default('$CC'),
  interval: varchar('interval', { length: 20 }).notNull().default('monthly'),
  features: jsonb('features').default('[]'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const subscriptions = pgTable('subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  planId: uuid('plan_id').notNull().references(() => plans.id),
  status: subscriptionStatusEnum('status').default('pending'),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxSubscriptionsOrgStatus: index('idx_subscriptions_org_status').on(table.orgId, table.status)
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  subscriptionId: uuid('subscription_id').notNull().references(() => subscriptions.id),
  amountDue: integer('amount_due').notNull(),
  currency: varchar('currency', { length: 10 }).default('$CC'),
  status: varchar('invoice_status', { length: 20 }).default('draft'),
  lineItems: jsonb('line_items').default('[]'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  dueDate: timestamp('due_date', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  type: varchar('type', { length: 32 }).notNull().default('canton_cc'),
  label: varchar('label', { length: 255 }),
  walletAddress: varchar('wallet_address', { length: 255 }),
  isDefault: boolean('is_default').default(false),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const providers = pgTable('providers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  category: providerCategoryEnum('category').notNull(),
  description: text('description'),
  website: varchar('website', { length: 512 }),
  contactEmail: varchar('contact_email', { length: 255 }),
  logoUrl: varchar('logo_url', { length: 512 }),
  status: providerStatusEnum('status').default('active'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

export const providerApplications = pgTable('provider_applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providers.id),
  orgId: uuid('org_id').notNull().references(() => organizations.id),
  userId: uuid('user_id').notNull().references(() => users.id),
  message: text('message'),
  status: joinRequestStatusEnum('status').default('pending'),
  reviewedBy: uuid('reviewed_by').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueProviderApplicant: uniqueIndex('unique_provider_applicant').on(table.providerId, table.userId)
}));

// Canton Ecosystem Participants (replaces static canton-data.ts)
export const participants = pgTable('participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  legacyId: varchar('legacy_id', { length: 64 }).unique(), // e.g. "p_fireblocks" — maps to canton-data.ts IDs
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  logoUrl: varchar('logo_url', { length: 512 }),
  website: varchar('website', { length: 512 }),

  // Canton identity
  cantonPartyId: varchar('canton_party_id', { length: 195 }).unique(), // real Canton Party ID once claimed
  roles: jsonb('roles').default('[]'), // string[] — e.g. ["Custody", "Wallet"]
  capabilities: jsonb('capabilities').default('{}'), // Record<string, number> — matches existing type
  criticality: participantCriticalityEnum('criticality').default('optional'),

  // Network info
  holdings: varchar('holdings', { length: 64 }),
  validatorNodes: integer('validator_nodes').default(0),
  superValidator: boolean('super_validator').default(false),

  // Verification / claim workflow
  verificationStatus: participantVerificationEnum('verification_status').default('unclaimed').notNull(),
  claimedByUserId: uuid('claimed_by_user_id').references(() => users.id),
  claimedByOrgId: uuid('claimed_by_org_id').references(() => organizations.id),
  claimedAt: timestamp('claimed_at', { withTimezone: true }),
  reviewedByUserId: uuid('reviewed_by_user_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  rejectionReason: text('rejection_reason'),

  // Contact info (populated during onboarding)
  contactEmail: varchar('contact_email', { length: 255 }),
  contactName: varchar('contact_name', { length: 255 }),

  // Metadata
  metadata: jsonb('metadata'), // flexible store for extra data
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  idxParticipantsLegacyId: index('idx_participants_legacy_id').on(table.legacyId),
  idxParticipantsVerification: index('idx_participants_verification').on(table.verificationStatus),
  idxParticipantsCantonPartyId: index('idx_participants_canton_party_id').on(table.cantonPartyId),
  idxParticipantsName: index('idx_participants_name').on(table.name)
}));

// ============================================================
// Liz's Architecture: Templates → Flows → Live Workflows
// ============================================================

// Layer 1: Canton Templates — Reusable role definitions (Building Blocks)
export const cantonTemplates = pgTable('canton_templates', {
  id: varchar('id', { length: 32 }).primaryKey(), // e.g. 'TMPL-001'
  name: varchar('name', { length: 255 }).notNull().unique(),
  description: text('description'),
  category: varchar('category', { length: 128 }), // e.g. 'Asset Safekeeping', 'Cash & Settlement'
  participantColumn: varchar('participant_column', { length: 64 }), // maps to capability key
  iconName: varchar('icon_name', { length: 64 }), // for UI rendering
  color: varchar('color', { length: 32 }), // for UI color coding
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Layer 2: Canton Flows — Assembled Workflows (ordered sequences of template steps)
export const cantonFlows = pgTable('canton_flows', {
  id: varchar('id', { length: 32 }).primaryKey(), // e.g. 'FLOW-001'
  name: varchar('name', { length: 255 }).notNull(),
  category: varchar('category', { length: 128 }), // e.g. 'Collateral Mobility'
  description: text('description'),
  source: varchar('source', { length: 512 }), // e.g. 'Canton Working Group Rounds 1-4'
  status: cantonFlowStatusEnum('status').default('planned'),
  stepCount: integer('step_count').default(0),
  sortOrder: integer('sort_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

// Flow Steps — Join table linking Flows to Templates in order
export const cantonFlowSteps = pgTable('canton_flow_steps', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: varchar('flow_id', { length: 32 }).notNull().references(() => cantonFlows.id),
  step: integer('step').notNull(), // sequence order within the flow
  templateId: varchar('template_id', { length: 32 }).notNull().references(() => cantonTemplates.id),
  templateName: varchar('template_name', { length: 255 }).notNull(), // denormalized for easy lookup
  action: text('action'), // what this template does at this step
  inputs: text('inputs'), // what this step receives
  outputs: text('outputs'), // what this step produces
  triggersNext: varchar('triggers_next', { length: 255 }), // next step/template
  cantonPrivacy: text('canton_privacy'), // how Canton privacy applies
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueCantonFlowStep: uniqueIndex('unique_canton_flow_step').on(table.flowId, table.step),
  idxCantonFlowStepsFlowId: index('idx_canton_flow_steps_flow_id').on(table.flowId),
  idxCantonFlowStepsTemplateId: index('idx_canton_flow_steps_template_id').on(table.templateId)
}));

// Template Participants — Which Canton participants can fill which template roles
export const templateParticipants = pgTable('template_participants', {
  id: uuid('id').primaryKey().defaultRandom(),
  templateId: varchar('template_id', { length: 32 }).notNull().references(() => cantonTemplates.id),
  templateName: varchar('template_name', { length: 255 }).notNull(), // denormalized
  participantLegacyId: varchar('participant_legacy_id', { length: 64 }).notNull(), // e.g. 'p_fireblocks'
  organization: varchar('organization', { length: 255 }),
  criticality: participantCriticalityEnum('criticality').default('optional'),
  isSV: boolean('is_sv').default(false),
  isValidator: boolean('is_validator').default(false),
  cantonRole: varchar('canton_role', { length: 512 }),
  foundationCategory: varchar('foundation_category', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueTemplateParticipant: uniqueIndex('unique_tmpl_participant').on(table.templateId, table.participantLegacyId),
  idxTemplateParticipantsTemplateId: index('idx_template_participants_template_id').on(table.templateId),
  idxTemplateParticipantsParticipant: index('idx_template_participants_participant').on(table.participantLegacyId)
}));

// Layer 3: Live Workflow Assignments — Specific participants slotted into flow steps
export const liveWorkflowAssignments = pgTable('live_workflow_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  flowId: uuid('flow_id').notNull().references(() => flows.id), // user's flow instance
  cantonFlowStepId: uuid('canton_flow_step_id').notNull().references(() => cantonFlowSteps.id),
  stepNumber: integer('step_number').notNull(),
  templateName: varchar('template_name', { length: 255 }).notNull(),
  participantLegacyId: varchar('participant_legacy_id', { length: 64 }), // assigned participant
  participantName: varchar('participant_name', { length: 255 }), // denormalized
  assignedBy: uuid('assigned_by').references(() => users.id),
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
}, (table) => ({
  uniqueLiveAssignment: uniqueIndex('unique_live_assignment').on(table.flowId, table.cantonFlowStepId),
  idxLiveAssignmentsFlowId: index('idx_live_assignments_flow_id').on(table.flowId)
}));

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

export type Plan = InferSelectModel<typeof plans>;
export type NewPlan = InferInsertModel<typeof plans>;

export type Subscription = InferSelectModel<typeof subscriptions>;
export type NewSubscription = InferInsertModel<typeof subscriptions>;

export type Invoice = InferSelectModel<typeof invoices>;
export type NewInvoice = InferInsertModel<typeof invoices>;

export type PaymentMethod = InferSelectModel<typeof paymentMethods>;
export type NewPaymentMethod = InferInsertModel<typeof paymentMethods>;

export type Provider = InferSelectModel<typeof providers>;
export type NewProvider = InferInsertModel<typeof providers>;

export type ProviderApplication = InferSelectModel<typeof providerApplications>;
export type NewProviderApplication = InferInsertModel<typeof providerApplications>;

export type Participant = InferSelectModel<typeof participants>;
export type NewParticipant = InferInsertModel<typeof participants>;

export type CantonTemplate = InferSelectModel<typeof cantonTemplates>;
export type NewCantonTemplate = InferInsertModel<typeof cantonTemplates>;

export type CantonFlow = InferSelectModel<typeof cantonFlows>;
export type NewCantonFlow = InferInsertModel<typeof cantonFlows>;

export type CantonFlowStep = InferSelectModel<typeof cantonFlowSteps>;
export type NewCantonFlowStep = InferInsertModel<typeof cantonFlowSteps>;

export type TemplateParticipant = InferSelectModel<typeof templateParticipants>;
export type NewTemplateParticipant = InferInsertModel<typeof templateParticipants>;

export type LiveWorkflowAssignment = InferSelectModel<typeof liveWorkflowAssignments>;
export type NewLiveWorkflowAssignment = InferInsertModel<typeof liveWorkflowAssignments>;