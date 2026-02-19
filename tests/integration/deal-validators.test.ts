import { describe, it, expect } from 'vitest';
import {
  createDealSchema,
  updateDealStatusSchema,
  addParticipantSchema,
  removeParticipantSchema,
} from '@/lib/validators/deals';
import { sendMessageSchema, editMessageSchema } from '@/lib/validators/messages';

describe('deal schema edge cases', () => {
  describe('createDealSchema', () => {
    it('accepts title only', () => {
      expect(createDealSchema.safeParse({ title: 'Deal Alpha' }).success).toBe(true);
    });

    it('accepts all optional fields', () => {
      const result = createDealSchema.safeParse({
        title: 'Full Deal',
        description: 'A detailed description',
        flowId: '123e4567-e89b-12d3-a456-426614174000',
        volume: '$500M',
        metadata: { key: 'value' },
      });
      expect(result.success).toBe(true);
    });

    it('rejects title over 255 chars', () => {
      expect(createDealSchema.safeParse({ title: 'x'.repeat(256) }).success).toBe(false);
    });

    it('rejects description over 5000 chars', () => {
      expect(createDealSchema.safeParse({ title: 'Ok', description: 'x'.repeat(5001) }).success).toBe(false);
    });

    it('rejects invalid flowId format', () => {
      expect(createDealSchema.safeParse({ title: 'Ok', flowId: 'not-a-uuid' }).success).toBe(false);
    });

    it('trims whitespace from title', () => {
      const result = createDealSchema.safeParse({ title: '  Trimmed  ' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Trimmed');
      }
    });
  });

  describe('updateDealStatusSchema', () => {
    const VALID_STATUSES = ['draft', 'open', 'negotiating', 'locked', 'committed'];

    it.each(VALID_STATUSES)('accepts status: %s', (status) => {
      expect(updateDealStatusSchema.safeParse({ status }).success).toBe(true);
    });

    it('rejects unknown status', () => {
      expect(updateDealStatusSchema.safeParse({ status: 'cancelled' }).success).toBe(false);
      expect(updateDealStatusSchema.safeParse({ status: '' }).success).toBe(false);
    });
  });

  describe('addParticipantSchema', () => {
    it('accepts valid participant data', () => {
      const result = addParticipantSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: 'editor',
      });
      expect(result.success).toBe(true);
    });

    it('defaults role to viewer when not specified', () => {
      const result = addParticipantSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.role).toBe('viewer');
      }
    });

    it('rejects invalid userId', () => {
      expect(addParticipantSchema.safeParse({ userId: 'bad-id' }).success).toBe(false);
    });

    it('rejects invalid role', () => {
      expect(addParticipantSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
        role: 'superadmin',
      }).success).toBe(false);
    });
  });

  describe('removeParticipantSchema', () => {
    it('accepts valid UUID', () => {
      expect(removeParticipantSchema.safeParse({
        userId: '123e4567-e89b-12d3-a456-426614174000',
      }).success).toBe(true);
    });

    it('rejects non-UUID', () => {
      expect(removeParticipantSchema.safeParse({ userId: 'not-uuid' }).success).toBe(false);
    });
  });
});

describe('message schema edge cases', () => {
  describe('sendMessageSchema', () => {
    it('accepts plain text message', () => {
      const result = sendMessageSchema.safeParse({ content: 'Hello world' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.contentType).toBe('text');
      }
    });

    it('accepts file content type', () => {
      const result = sendMessageSchema.safeParse({ content: 'file.pdf', contentType: 'file' });
      expect(result.success).toBe(true);
    });

    it('accepts system content type', () => {
      const result = sendMessageSchema.safeParse({ content: 'User joined', contentType: 'system' });
      expect(result.success).toBe(true);
    });

    it('rejects content over 10000 chars', () => {
      expect(sendMessageSchema.safeParse({ content: 'x'.repeat(10001) }).success).toBe(false);
    });

    it('rejects invalid threadId format', () => {
      expect(sendMessageSchema.safeParse({ content: 'Hi', threadId: 'not-uuid' }).success).toBe(false);
    });

    it('rejects invalid contentType', () => {
      expect(sendMessageSchema.safeParse({ content: 'Hi', contentType: 'video' }).success).toBe(false);
    });
  });

  describe('editMessageSchema', () => {
    it('accepts valid edit', () => {
      expect(editMessageSchema.safeParse({ content: 'Updated text' }).success).toBe(true);
    });

    it('rejects empty edit', () => {
      expect(editMessageSchema.safeParse({ content: '' }).success).toBe(false);
    });

    it('rejects edit over 10000 chars', () => {
      expect(editMessageSchema.safeParse({ content: 'x'.repeat(10001) }).success).toBe(false);
    });
  });
});
