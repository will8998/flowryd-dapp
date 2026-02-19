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
  nodeApiConfigs
} from './schema';

export const organizationsRelations = relations(organizations, ({ many }) => ({
  users: many(users),
  flows: many(flows),
  deals: many(deals),
  nodeApiConfigs: many(nodeApiConfigs),
  auditLogs: many(auditLog)
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
  activeSessions: many(activeSessions)
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
  joinRequests: many(joinRequests)
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