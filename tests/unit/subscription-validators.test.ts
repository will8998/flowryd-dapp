import { describe, it, expect } from 'vitest';
import { 
  createSubscriptionSchema, 
  cancelSubscriptionSchema, 
  createPaymentMethodSchema 
} from '@/lib/validators/subscriptions';

describe('subscription validators', () => {
  describe('createSubscriptionSchema', () => {
    it('accepts valid subscription data with required planId', () => {
      const validData = {
        planId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.planId).toBe('123e4567-e89b-12d3-a456-426614174000');
      }
    });

    it('accepts valid subscription data with optional paymentMethodId', () => {
      const validData = {
        planId: '123e4567-e89b-12d3-a456-426614174000',
        paymentMethodId: '987fcdeb-51a2-43d1-9f6e-123456789abc'
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.planId).toBe('123e4567-e89b-12d3-a456-426614174000');
        expect(result.data.paymentMethodId).toBe('987fcdeb-51a2-43d1-9f6e-123456789abc');
      }
    });

    it('rejects missing planId', () => {
      const invalidData = {};

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects empty planId', () => {
      const invalidData = {
        planId: ''
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID format for planId', () => {
      const invalidData = {
        planId: 'not-a-uuid'
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid UUID format for paymentMethodId', () => {
      const invalidData = {
        planId: '123e4567-e89b-12d3-a456-426614174000',
        paymentMethodId: 'invalid-uuid'
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts paymentMethodId as undefined', () => {
      const validData = {
        planId: '123e4567-e89b-12d3-a456-426614174000',
        paymentMethodId: undefined
      };

      const result = createSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects null planId', () => {
      const invalidData = {
        planId: null
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-string planId', () => {
      const invalidData = {
        planId: 12345
      };

      const result = createSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('cancelSubscriptionSchema', () => {
    it('accepts valid cancellation with reason', () => {
      const validData = {
        reason: 'No longer needed'
      };

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.reason).toBe('No longer needed');
      }
    });

    it('accepts empty object (reason is optional)', () => {
      const validData = {};

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts undefined reason', () => {
      const validData = {
        reason: undefined
      };

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts reason at maximum length (500 chars)', () => {
      const maxLengthReason = 'a'.repeat(500);
      const validData = {
        reason: maxLengthReason
      };

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects reason exceeding maximum length', () => {
      const tooLongReason = 'a'.repeat(501);
      const invalidData = {
        reason: tooLongReason
      };

      const result = cancelSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts empty string reason', () => {
      const validData = {
        reason: ''
      };

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects non-string reason', () => {
      const invalidData = {
        reason: 12345
      };

      const result = cancelSubscriptionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts multiline reason', () => {
      const validData = {
        reason: 'Line 1\nLine 2\nLine 3'
      };

      const result = cancelSubscriptionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('createPaymentMethodSchema', () => {
    it('accepts valid payment method with default type', () => {
      const validData = {};

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('mock');
      }
    });

    it('accepts canton_cc type', () => {
      const validData = {
        type: 'canton_cc' as const
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('canton_cc');
      }
    });

    it('accepts mock type explicitly', () => {
      const validData = {
        type: 'mock' as const
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('mock');
      }
    });

    it('accepts optional label', () => {
      const validData = {
        type: 'canton_cc' as const,
        label: 'My Canton Wallet'
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.label).toBe('My Canton Wallet');
      }
    });

    it('accepts optional walletAddress', () => {
      const validData = {
        type: 'canton_cc' as const,
        walletAddress: '0x1234567890abcdef'
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.walletAddress).toBe('0x1234567890abcdef');
      }
    });

    it('accepts all fields together', () => {
      const validData = {
        type: 'canton_cc' as const,
        label: 'Primary Wallet',
        walletAddress: 'canton::wallet-abc123'
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.type).toBe('canton_cc');
        expect(result.data.label).toBe('Primary Wallet');
        expect(result.data.walletAddress).toBe('canton::wallet-abc123');
      }
    });

    it('rejects invalid type', () => {
      const invalidData = {
        type: 'stripe'
      };

      const result = createPaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects label exceeding maximum length', () => {
      const tooLongLabel = 'a'.repeat(256);
      const invalidData = {
        label: tooLongLabel
      };

      const result = createPaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts label at maximum length (255 chars)', () => {
      const maxLengthLabel = 'a'.repeat(255);
      const validData = {
        label: maxLengthLabel
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects walletAddress exceeding maximum length', () => {
      const tooLongAddress = 'a'.repeat(256);
      const invalidData = {
        walletAddress: tooLongAddress
      };

      const result = createPaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts walletAddress at maximum length (255 chars)', () => {
      const maxLengthAddress = 'a'.repeat(255);
      const validData = {
        walletAddress: maxLengthAddress
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts empty string label', () => {
      const validData = {
        label: ''
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts empty string walletAddress', () => {
      const validData = {
        walletAddress: ''
      };

      const result = createPaymentMethodSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects non-string label', () => {
      const invalidData = {
        label: 12345
      };

      const result = createPaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-string walletAddress', () => {
      const invalidData = {
        walletAddress: 12345
      };

      const result = createPaymentMethodSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});