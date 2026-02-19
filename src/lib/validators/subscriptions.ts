import { z } from 'zod';

export const createSubscriptionSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  paymentMethodId: z.string().uuid('Invalid payment method ID').optional(),
});

export const cancelSubscriptionSchema = z.object({
  reason: z.string().max(500).optional(),
});

export const createPaymentMethodSchema = z.object({
  type: z.enum(['canton_cc', 'mock']).default('mock'),
  label: z.string().max(255).optional(),
  walletAddress: z.string().max(255).optional(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
export type CancelSubscriptionInput = z.infer<typeof cancelSubscriptionSchema>;
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;