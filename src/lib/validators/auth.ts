import { z } from 'zod';
import { isValidPartyId } from '@/lib/auth/validate-party-id';

export const loginSchema = z.object({
  partyId: z
    .string()
    .min(1, 'Party-ID is required')
    .max(195, 'Party-ID exceeds maximum length')
    .refine(isValidPartyId, 'Invalid Canton Party-ID format (expected: orgname::identifier)'),
});

export const registerSchema = z.object({
  partyId: z
    .string()
    .min(1, 'Party-ID is required')
    .max(195, 'Party-ID exceeds maximum length')
    .refine(isValidPartyId, 'Invalid Canton Party-ID format (expected: orgname::identifier)'),
  displayName: z
    .string()
    .min(1, 'Display name is required')
    .max(255, 'Display name is too long')
    .trim(),
  orgName: z
    .string()
    .min(1, 'Organization name is required')
    .max(255, 'Organization name is too long')
    .trim(),
  email: z
    .string()
    .email('Invalid email address')
    .max(255, 'Email is too long')
    .optional()
    .or(z.literal('')),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
