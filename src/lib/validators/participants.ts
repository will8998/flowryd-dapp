import { z } from 'zod';

export const participantListQuerySchema = z.object({
  status: z.enum(['unclaimed', 'pending', 'approved', 'verified', 'rejected']).optional(),
  role: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
});

export const createParticipantSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  website: z.string().url().max(512).optional(),
  roles: z.array(z.string()).min(1),
  contactEmail: z.string().email().max(255),
  contactName: z.string().min(1).max(255),
});

export const updateParticipantSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  website: z.string().url().max(512).optional(),
  roles: z.array(z.string()).min(1).optional(),
  contactEmail: z.string().email().max(255).optional(),
  contactName: z.string().min(1).max(255).optional(),
  logoUrl: z.string().url().max(512).optional(),
  capabilities: z.record(z.string(), z.number()).optional(),
  criticality: z.enum(['critical', 'required', 'optional']).optional(),
  holdings: z.string().max(64).optional(),
  validatorNodes: z.number().min(0).optional(),
  superValidator: z.boolean().optional(),
});

export const claimParticipantSchema = z.object({
  contactEmail: z.string().email().max(255),
  contactName: z.string().min(1).max(255),
  description: z.string().optional(),
  website: z.string().url().max(512).optional(),
});

export const reviewParticipantSchema = z.object({
  action: z.enum(['approve', 'reject']),
  rejectionReason: z.string().optional(),
});

export type ParticipantListQuery = z.infer<typeof participantListQuerySchema>;
export type CreateParticipantBody = z.infer<typeof createParticipantSchema>;
export type UpdateParticipantBody = z.infer<typeof updateParticipantSchema>;
export type ClaimParticipantBody = z.infer<typeof claimParticipantSchema>;
export type ReviewParticipantBody = z.infer<typeof reviewParticipantSchema>;