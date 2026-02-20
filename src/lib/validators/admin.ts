import { z } from 'zod';

// Pagination and filtering schemas
export const paginationParamsSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(25),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(['asc', 'desc']).default('desc'),
});

export const statusFilterSchema = z.object({
  status: z.string().optional(),
});

// Organization schemas
export const createOrganizationSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/),
  domain: z.string().max(255).optional(),
});

export const updateOrganizationSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  domain: z.string().max(255).optional(),
});

// Plan schemas
export const createPlanSchema = z.object({
  name: z.string().min(1).max(255),
  tier: z.enum(['discover', 'navigate', 'activate']),
  priceAmount: z.number().int().min(0),
  priceCurrency: z.string().max(10).default('$CC'),
  interval: z.string().max(20).default('monthly'),
  features: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export const updatePlanSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  priceAmount: z.number().int().min(0).optional(),
  priceCurrency: z.string().max(10).optional(),
  interval: z.string().max(20).optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Provider schemas
export const createProviderSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['strategy', 'development', 'creative']),
  description: z.string().optional(),
  website: z.string().max(512).optional(),
  contactEmail: z.string().max(255).optional(),
  logoUrl: z.string().max(512).optional(),
  status: z.enum(['pending', 'active', 'inactive']).default('active'),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateProviderSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  category: z.enum(['strategy', 'development', 'creative']).optional(),
  description: z.string().optional(),
  website: z.string().max(512).optional(),
  contactEmail: z.string().max(255).optional(),
  logoUrl: z.string().max(512).optional(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Invoice schemas
export const createInvoiceSchema = z.object({
  orgId: z.string().uuid(),
  subscriptionId: z.string().uuid(),
  amountDue: z.number().int().min(0),
  currency: z.string().max(10).default('$CC'),
  status: z.string().max(20).default('draft'),
  lineItems: z.array(z.record(z.string(), z.unknown())).default([]),
  dueDate: z.string().datetime(),
});

export const updateInvoiceSchema = z.object({
  status: z.string().max(20).optional(),
  paidAt: z.string().datetime().optional(),
});

// Payment method schemas
export const createPaymentMethodSchema = z.object({
  orgId: z.string().uuid(),
  type: z.string().max(32).default('canton_cc'),
  label: z.string().max(255).optional(),
  walletAddress: z.string().max(255).optional(),
  isDefault: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Subscription schemas (extending existing)
export const createSubscriptionSchema = z.object({
  orgId: z.string().uuid(),
  planId: z.string().uuid(),
  status: z.enum(['pending', 'trial', 'active', 'past_due', 'cancelled', 'expired']).default('pending'),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  trialEndsAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateSubscriptionSchema = z.object({
  planId: z.string().uuid().optional(),
  status: z.enum(['pending', 'trial', 'active', 'past_due', 'cancelled', 'expired']).optional(),
  currentPeriodStart: z.string().datetime().optional(),
  currentPeriodEnd: z.string().datetime().optional(),
  cancelledAt: z.string().datetime().optional(),
  trialEndsAt: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Deal admin schemas
export const updateDealSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'open', 'negotiating', 'locked', 'committed']).optional(),
  volume: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

// Flow admin schemas
export const updateFlowSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  isTemplate: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  featuredHeadline: z.string().max(500).optional(),
  featuredSource: z.string().max(500).optional(),
  workflowType: z.string().max(64).optional(),
});

// Type exports
export type PaginationParams = z.infer<typeof paginationParamsSchema>;
export type StatusFilter = z.infer<typeof statusFilterSchema>;
export type CreateOrganization = z.infer<typeof createOrganizationSchema>;
export type UpdateOrganization = z.infer<typeof updateOrganizationSchema>;
export type CreatePlan = z.infer<typeof createPlanSchema>;
export type UpdatePlan = z.infer<typeof updatePlanSchema>;
export type CreateProvider = z.infer<typeof createProviderSchema>;
export type UpdateProvider = z.infer<typeof updateProviderSchema>;
export type CreateInvoice = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoice = z.infer<typeof updateInvoiceSchema>;
export type CreatePaymentMethod = z.infer<typeof createPaymentMethodSchema>;
export type CreateSubscription = z.infer<typeof createSubscriptionSchema>;
export type UpdateSubscription = z.infer<typeof updateSubscriptionSchema>;
export type UpdateDeal = z.infer<typeof updateDealSchema>;
export type UpdateFlow = z.infer<typeof updateFlowSchema>;