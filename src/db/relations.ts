import { relations } from 'drizzle-orm';
import {
  organizations,
  users,
  refreshTokens,
  flows,
  flowVersions,
  flowParticipants,
  deals,
  dealParticipants,
  messages,
  joinRequests,
  auditLog,
  activeSessions,
  nodeApiConfigs,
  plans,
  subscriptions,
  invoices,
  paymentMethods,
  providers,
  providerApplications,
  participants,
  cantonTemplates,
  cantonFlows,
  cantonFlowSteps,
  templateParticipants,
  liveWorkflowAssignments
} from './schema';

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  flows: many(flows),
  deals: many(deals),
  nodeApiConfigs: many(nodeApiConfigs),
  auditLogs: many(auditLog),
  subscriptions: many(subscriptions),
  invoices: many(invoices),
  paymentMethods: many(paymentMethods),
  providerApplications: many(providerApplications),
  claimedParticipants: many(participants, { relationName: 'participantOrg' })
}));

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id]
  }),
  refreshTokens: many(refreshTokens),
  createdFlows: many(flows, { relationName: 'flowCreatedBy' }),
  updatedFlows: many(flows, { relationName: 'flowUpdatedBy' }),
  flowVersions: many(flowVersions),
  flowParticipants: many(flowParticipants),
  createdDeals: many(deals),
  dealParticipants: many(dealParticipants),
  sentMessages: many(messages),
  joinRequests: many(joinRequests, { relationName: 'joinRequestRequester' }),
  reviewedJoinRequests: many(joinRequests, { relationName: 'joinRequestReviewer' }),
  auditLogs: many(auditLog),
  activeSessions: many(activeSessions),
  providerApplications: many(providerApplications),
  claimedParticipants: many(participants, { relationName: 'participantClaimedBy' }),
  reviewedParticipants: many(participants, { relationName: 'participantReviewedBy' })
}));

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id]
  })
}));

export const flowsRelations = relations(flows, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [flows.orgId],
    references: [organizations.id]
  }),
  createdBy: one(users, {
    fields: [flows.createdBy],
    references: [users.id],
    relationName: 'flowCreatedBy'
  }),
  updatedBy: one(users, {
    fields: [flows.updatedBy],
    references: [users.id],
    relationName: 'flowUpdatedBy'
  }),
  versions: many(flowVersions),
  participants: many(flowParticipants),
  deals: many(deals),
  joinRequests: many(joinRequests),
  liveWorkflowAssignments: many(liveWorkflowAssignments)
}));

export const flowVersionsRelations = relations(flowVersions, ({ one }) => ({
  flow: one(flows, {
    fields: [flowVersions.flowId],
    references: [flows.id]
  }),
  createdBy: one(users, {
    fields: [flowVersions.createdBy],
    references: [users.id]
  })
}));

export const flowParticipantsRelations = relations(flowParticipants, ({ one }) => ({
  flow: one(flows, {
    fields: [flowParticipants.flowId],
    references: [flows.id]
  }),
  addedBy: one(users, {
    fields: [flowParticipants.addedBy],
    references: [users.id]
  })
}));

export const dealsRelations = relations(deals, ({ one, many }) => ({
  flow: one(flows, {
    fields: [deals.flowId],
    references: [flows.id]
  }),
  organization: one(organizations, {
    fields: [deals.orgId],
    references: [organizations.id]
  }),
  createdBy: one(users, {
    fields: [deals.createdBy],
    references: [users.id]
  }),
  participants: many(dealParticipants),
  messages: many(messages),
  activeSessions: many(activeSessions)
}));

export const dealParticipantsRelations = relations(dealParticipants, ({ one }) => ({
  deal: one(deals, {
    fields: [dealParticipants.dealId],
    references: [deals.id]
  }),
  user: one(users, {
    fields: [dealParticipants.userId],
    references: [users.id]
  })
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  deal: one(deals, {
    fields: [messages.dealId],
    references: [deals.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  thread: one(messages, {
    fields: [messages.threadId],
    references: [messages.id],
    relationName: 'messageThread'
  }),
  replies: many(messages, { relationName: 'messageThread' })
}));

export const joinRequestsRelations = relations(joinRequests, ({ one }) => ({
  flow: one(flows, {
    fields: [joinRequests.flowId],
    references: [flows.id]
  }),
  requester: one(users, {
    fields: [joinRequests.requesterId],
    references: [users.id],
    relationName: 'joinRequestRequester'
  }),
  reviewedBy: one(users, {
    fields: [joinRequests.reviewedBy],
    references: [users.id],
    relationName: 'joinRequestReviewer'
  })
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, {
    fields: [auditLog.userId],
    references: [users.id]
  }),
  organization: one(organizations, {
    fields: [auditLog.orgId],
    references: [organizations.id]
  })
}));

export const activeSessionsRelations = relations(activeSessions, ({ one }) => ({
  user: one(users, {
    fields: [activeSessions.userId],
    references: [users.id]
  }),
  deal: one(deals, {
    fields: [activeSessions.dealId],
    references: [deals.id]
  })
}));

export const nodeApiConfigsRelations = relations(nodeApiConfigs, ({ one }) => ({
  organization: one(organizations, {
    fields: [nodeApiConfigs.orgId],
    references: [organizations.id]
  })
}));

export const plansRelations = relations(plans, ({ many }) => ({
  subscriptions: many(subscriptions),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [subscriptions.orgId],
    references: [organizations.id]
  }),
  plan: one(plans, {
    fields: [subscriptions.planId],
    references: [plans.id]
  }),
  invoices: many(invoices),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  organization: one(organizations, {
    fields: [invoices.orgId],
    references: [organizations.id]
  }),
  subscription: one(subscriptions, {
    fields: [invoices.subscriptionId],
    references: [subscriptions.id]
  }),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ one }) => ({
  organization: one(organizations, {
    fields: [paymentMethods.orgId],
    references: [organizations.id]
  }),
}));

export const providersRelations = relations(providers, ({ many }) => ({
  applications: many(providerApplications),
}));

export const providerApplicationsRelations = relations(providerApplications, ({ one }) => ({
  provider: one(providers, {
    fields: [providerApplications.providerId],
    references: [providers.id]
  }),
  organization: one(organizations, {
    fields: [providerApplications.orgId],
    references: [organizations.id]
  }),
  user: one(users, {
    fields: [providerApplications.userId],
    references: [users.id]
  }),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  claimedByUser: one(users, {
    fields: [participants.claimedByUserId],
    references: [users.id],
    relationName: 'participantClaimedBy'
  }),
  claimedByOrg: one(organizations, {
    fields: [participants.claimedByOrgId],
    references: [organizations.id],
    relationName: 'participantOrg'
  }),
  reviewedByUser: one(users, {
    fields: [participants.reviewedByUserId],
    references: [users.id],
    relationName: 'participantReviewedBy'
  })
}));

// Canton Architecture Relations (Liz's spec)

export const cantonTemplatesRelations = relations(cantonTemplates, ({ many }) => ({
  flowSteps: many(cantonFlowSteps),
  templateParticipants: many(templateParticipants),
}));

export const cantonFlowsRelations = relations(cantonFlows, ({ many }) => ({
  steps: many(cantonFlowSteps),
}));

export const cantonFlowStepsRelations = relations(cantonFlowSteps, ({ one }) => ({
  flow: one(cantonFlows, {
    fields: [cantonFlowSteps.flowId],
    references: [cantonFlows.id]
  }),
  template: one(cantonTemplates, {
    fields: [cantonFlowSteps.templateId],
    references: [cantonTemplates.id]
  }),
}));

export const templateParticipantsRelations = relations(templateParticipants, ({ one }) => ({
  template: one(cantonTemplates, {
    fields: [templateParticipants.templateId],
    references: [cantonTemplates.id]
  }),
}));

export const liveWorkflowAssignmentsRelations = relations(liveWorkflowAssignments, ({ one }) => ({
  flow: one(flows, {
    fields: [liveWorkflowAssignments.flowId],
    references: [flows.id]
  }),
  cantonFlowStep: one(cantonFlowSteps, {
    fields: [liveWorkflowAssignments.cantonFlowStepId],
    references: [cantonFlowSteps.id]
  }),
  assignedByUser: one(users, {
    fields: [liveWorkflowAssignments.assignedBy],
    references: [users.id]
  }),
}));