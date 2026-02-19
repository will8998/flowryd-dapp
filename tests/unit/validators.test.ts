import { describe, it, expect } from 'vitest';
import { loginSchema, registerSchema } from '@/lib/validators/auth';
import { createFlowSchema, saveVersionSchema } from '@/lib/validators/flows';
import { createDealSchema, updateDealStatusSchema } from '@/lib/validators/deals';
import { sendMessageSchema } from '@/lib/validators/messages';

describe('auth validators', () => {
  describe('loginSchema', () => {
    it('accepts valid party ID', () => {
      const result = loginSchema.safeParse({ partyId: 'texture::1234' });
      expect(result.success).toBe(true);
    });

    it('rejects empty party ID', () => {
      const result = loginSchema.safeParse({ partyId: '' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid format', () => {
      const result = loginSchema.safeParse({ partyId: 'nocolon' });
      expect(result.success).toBe(false);
    });
  });

  describe('registerSchema', () => {
    it('accepts valid registration data', () => {
      const result = registerSchema.safeParse({
        partyId: 'texture::1234',
        displayName: 'Test User',
        orgName: 'Texture Finance',
      });
      expect(result.success).toBe(true);
    });

    it('accepts optional email', () => {
      const result = registerSchema.safeParse({
        partyId: 'texture::1234',
        displayName: 'Test User',
        orgName: 'Texture',
        email: 'test@example.com',
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      expect(registerSchema.safeParse({}).success).toBe(false);
      expect(registerSchema.safeParse({ partyId: 'a::b' }).success).toBe(false);
    });
  });
});

describe('flow validators', () => {
  it('createFlowSchema accepts valid data', () => {
    expect(createFlowSchema.safeParse({ title: 'My Flow' }).success).toBe(true);
    expect(createFlowSchema.safeParse({ title: 'My Flow', description: 'desc', workflowType: 'settlement' }).success).toBe(true);
  });

  it('createFlowSchema rejects empty title', () => {
    expect(createFlowSchema.safeParse({ title: '' }).success).toBe(false);
  });

  it('saveVersionSchema accepts nodes and edges', () => {
    const result = saveVersionSchema.safeParse({
      nodes: [{ id: 'n1', position: { x: 0, y: 0 }, data: {} }],
      edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
    });
    expect(result.success).toBe(true);
  });
});

describe('deal validators', () => {
  it('createDealSchema accepts valid data', () => {
    expect(createDealSchema.safeParse({ title: 'My Deal' }).success).toBe(true);
  });

  it('updateDealStatusSchema accepts valid statuses', () => {
    expect(updateDealStatusSchema.safeParse({ status: 'open' }).success).toBe(true);
    expect(updateDealStatusSchema.safeParse({ status: 'committed' }).success).toBe(true);
  });

  it('updateDealStatusSchema rejects invalid statuses', () => {
    expect(updateDealStatusSchema.safeParse({ status: 'invalid' }).success).toBe(false);
  });
});

describe('message validators', () => {
  it('sendMessageSchema accepts valid message', () => {
    expect(sendMessageSchema.safeParse({ content: 'Hello' }).success).toBe(true);
  });

  it('sendMessageSchema rejects empty message', () => {
    expect(sendMessageSchema.safeParse({ content: '' }).success).toBe(false);
  });

  it('sendMessageSchema accepts thread replies', () => {
    const result = sendMessageSchema.safeParse({
      content: 'Reply',
      threadId: '123e4567-e89b-12d3-a456-426614174000',
    });
    expect(result.success).toBe(true);
  });
});
