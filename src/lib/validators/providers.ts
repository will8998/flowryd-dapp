import { z } from 'zod';

const providerCategoryValues = ['strategy', 'development', 'creative'] as const;

export const createProviderSchema = z.object({
  name: z.string().min(1).max(255).trim(),
  category: z.enum(providerCategoryValues),
  description: z.string().max(5000).optional(),
  website: z.string().url().max(512).optional(),
  contactEmail: z.string().email().max(255).optional(),
});

export const providerApplicationSchema = z.object({
  message: z.string().max(2000).optional(),
});

export const reviewApplicationSchema = z.object({
  status: z.enum(['approved', 'rejected']),
});

export type CreateProviderInput = z.infer<typeof createProviderSchema>;
export type ProviderApplicationInput = z.infer<typeof providerApplicationSchema>;
export type ReviewApplicationInput = z.infer<typeof reviewApplicationSchema>;
