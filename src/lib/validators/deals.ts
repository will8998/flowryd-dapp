import { z } from 'zod';

const dealStatusValues = ['draft', 'open', 'negotiating', 'locked', 'committed'] as const;

export const createDealSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(255, 'Title is too long')
    .trim(),
  description: z.string().max(5000, 'Description is too long').optional(),
  flowId: z.string().uuid('Invalid flow ID').optional(),
  volume: z.string().max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const updateDealStatusSchema = z.object({
  status: z.enum(dealStatusValues),
});

export const addParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
  role: z.enum(['admin', 'editor', 'viewer']).default('viewer'),
});

export const removeParticipantSchema = z.object({
  userId: z.string().uuid('Invalid user ID'),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
export type UpdateDealStatusInput = z.infer<typeof updateDealStatusSchema>;
export type AddParticipantInput = z.infer<typeof addParticipantSchema>;
export type RemoveParticipantInput = z.infer<typeof removeParticipantSchema>;
