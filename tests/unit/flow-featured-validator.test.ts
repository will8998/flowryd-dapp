import { describe, it, expect } from 'vitest';
import { updateFlowFeaturedSchema } from '@/lib/validators/flows';

describe('flow featured validator', () => {
  describe('updateFlowFeaturedSchema', () => {
    it('accepts valid featured flow data with required isFeatured', () => {
      const validData = {
        isFeatured: true
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(true);
      }
    });

    it('accepts isFeatured as false', () => {
      const validData = {
        isFeatured: false
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(false);
      }
    });

    it('accepts all optional fields with isFeatured true', () => {
      const validData = {
        isFeatured: true,
        featuredHeadline: 'Revolutionary Settlement Flow',
        featuredSource: 'Featured by Texture Finance Team'
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(true);
        expect(result.data.featuredHeadline).toBe('Revolutionary Settlement Flow');
        expect(result.data.featuredSource).toBe('Featured by Texture Finance Team');
      }
    });

    it('accepts optional fields with isFeatured false', () => {
      const validData = {
        isFeatured: false,
        featuredHeadline: 'Previously featured flow',
        featuredSource: 'Historical data'
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isFeatured).toBe(false);
        expect(result.data.featuredHeadline).toBe('Previously featured flow');
        expect(result.data.featuredSource).toBe('Historical data');
      }
    });

    it('accepts undefined optional fields', () => {
      const validData = {
        isFeatured: true,
        featuredHeadline: undefined,
        featuredSource: undefined
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featuredHeadline).toBeUndefined();
        expect(result.data.featuredSource).toBeUndefined();
      }
    });

    it('accepts empty string optional fields', () => {
      const validData = {
        isFeatured: true,
        featuredHeadline: '',
        featuredSource: ''
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featuredHeadline).toBe('');
        expect(result.data.featuredSource).toBe('');
      }
    });

    it('accepts featuredHeadline at maximum length (500 chars)', () => {
      const maxLengthHeadline = 'a'.repeat(500);
      const validData = {
        isFeatured: true,
        featuredHeadline: maxLengthHeadline
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featuredHeadline).toBe(maxLengthHeadline);
      }
    });

    it('accepts featuredSource at maximum length (500 chars)', () => {
      const maxLengthSource = 'b'.repeat(500);
      const validData = {
        isFeatured: true,
        featuredSource: maxLengthSource
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featuredSource).toBe(maxLengthSource);
      }
    });

    it('accepts multiline featuredHeadline', () => {
      const validData = {
        isFeatured: true,
        featuredHeadline: 'Line 1\nLine 2\nLine 3'
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts multiline featuredSource', () => {
      const validData = {
        isFeatured: true,
        featuredSource: 'Source 1\nSource 2\nAdditional context'
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects missing isFeatured', () => {
      const invalidData = {
        featuredHeadline: 'Great flow'
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects empty object', () => {
      const invalidData = {};

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-boolean isFeatured', () => {
      const invalidData = {
        isFeatured: 'true'
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects null isFeatured', () => {
      const invalidData = {
        isFeatured: null
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects undefined isFeatured', () => {
      const invalidData = {
        isFeatured: undefined
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects featuredHeadline exceeding maximum length', () => {
      const tooLongHeadline = 'a'.repeat(501);
      const invalidData = {
        isFeatured: true,
        featuredHeadline: tooLongHeadline
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects featuredSource exceeding maximum length', () => {
      const tooLongSource = 'b'.repeat(501);
      const invalidData = {
        isFeatured: true,
        featuredSource: tooLongSource
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-string featuredHeadline', () => {
      const invalidData = {
        isFeatured: true,
        featuredHeadline: 12345
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-string featuredSource', () => {
      const invalidData = {
        isFeatured: true,
        featuredSource: 12345
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects array for isFeatured', () => {
      const invalidData = {
        isFeatured: [true]
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects object for isFeatured', () => {
      const invalidData = {
        isFeatured: { value: true }
      };

      const result = updateFlowFeaturedSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('handles edge case with both optional fields at max length', () => {
      const maxLengthHeadline = 'h'.repeat(500);
      const maxLengthSource = 's'.repeat(500);
      const validData = {
        isFeatured: true,
        featuredHeadline: maxLengthHeadline,
        featuredSource: maxLengthSource
      };

      const result = updateFlowFeaturedSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.featuredHeadline).toBe(maxLengthHeadline);
        expect(result.data.featuredSource).toBe(maxLengthSource);
      }
    });
  });
});