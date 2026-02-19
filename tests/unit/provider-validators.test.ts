import { describe, it, expect } from 'vitest';
import { 
  createProviderSchema, 
  providerApplicationSchema, 
  reviewApplicationSchema 
} from '@/lib/validators/providers';

describe('provider validators', () => {
  describe('createProviderSchema', () => {
    it('accepts valid provider data with required fields', () => {
      const validData = {
        name: 'Acme Strategy Consulting',
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Acme Strategy Consulting');
        expect(result.data.category).toBe('strategy');
      }
    });

    it('accepts all valid categories', () => {
      const categories = ['strategy', 'development', 'creative'] as const;

      for (const category of categories) {
        const validData = {
          name: 'Test Provider',
          category
        };

        const result = createProviderSchema.safeParse(validData);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.category).toBe(category);
        }
      }
    });

    it('accepts all optional fields', () => {
      const validData = {
        name: 'Full Service Provider',
        category: 'development' as const,
        description: 'We provide comprehensive development services',
        website: 'https://example.com',
        contactEmail: 'contact@example.com'
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.description).toBe('We provide comprehensive development services');
        expect(result.data.website).toBe('https://example.com');
        expect(result.data.contactEmail).toBe('contact@example.com');
      }
    });

    it('trims whitespace from name', () => {
      const validData = {
        name: '  Trimmed Name  ',
        category: 'creative' as const
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Trimmed Name');
      }
    });

    it('rejects missing name', () => {
      const invalidData = {
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects empty name', () => {
      const invalidData = {
        name: '',
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('trims whitespace-only name to empty and accepts it', () => {
      const validData = {
        name: '   ',
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('');
      }
    });

    it('rejects name exceeding maximum length', () => {
      const tooLongName = 'a'.repeat(256);
      const invalidData = {
        name: tooLongName,
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts name at maximum length (255 chars)', () => {
      const maxLengthName = 'a'.repeat(255);
      const validData = {
        name: maxLengthName,
        category: 'strategy' as const
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects missing category', () => {
      const invalidData = {
        name: 'Test Provider'
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid category', () => {
      const invalidData = {
        name: 'Test Provider',
        category: 'invalid-category'
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects description exceeding maximum length', () => {
      const tooLongDescription = 'a'.repeat(5001);
      const invalidData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        description: tooLongDescription
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts description at maximum length (5000 chars)', () => {
      const maxLengthDescription = 'a'.repeat(5000);
      const validData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        description: maxLengthDescription
      };

      const result = createProviderSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects invalid website URL', () => {
      const invalidData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        website: 'not-a-url'
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts various valid website URLs', () => {
      const validUrls = [
        'https://example.com',
        'http://example.com',
        'https://www.example.com/path',
        'https://subdomain.example.com',
        'https://example.com:8080'
      ];

      for (const website of validUrls) {
        const validData = {
          name: 'Test Provider',
          category: 'strategy' as const,
          website
        };

        const result = createProviderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    });

    it('rejects website URL exceeding maximum length', () => {
      const tooLongUrl = 'https://example.com/' + 'a'.repeat(500);
      const invalidData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        website: tooLongUrl
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid email format', () => {
      const invalidData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        contactEmail: 'not-an-email'
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts valid email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'contact+info@company.org',
        'admin@subdomain.example.com'
      ];

      for (const contactEmail of validEmails) {
        const validData = {
          name: 'Test Provider',
          category: 'strategy' as const,
          contactEmail
        };

        const result = createProviderSchema.safeParse(validData);
        expect(result.success).toBe(true);
      }
    });

    it('rejects email exceeding maximum length', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      const invalidData = {
        name: 'Test Provider',
        category: 'strategy' as const,
        contactEmail: longEmail
      };

      const result = createProviderSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('providerApplicationSchema', () => {
    it('accepts valid application with message', () => {
      const validData = {
        message: 'I would like to apply to become a provider on your platform.'
      };

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.message).toBe('I would like to apply to become a provider on your platform.');
      }
    });

    it('accepts empty object (message is optional)', () => {
      const validData = {};

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts undefined message', () => {
      const validData = {
        message: undefined
      };

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts empty string message', () => {
      const validData = {
        message: ''
      };

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('accepts message at maximum length (2000 chars)', () => {
      const maxLengthMessage = 'a'.repeat(2000);
      const validData = {
        message: maxLengthMessage
      };

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects message exceeding maximum length', () => {
      const tooLongMessage = 'a'.repeat(2001);
      const invalidData = {
        message: tooLongMessage
      };

      const result = providerApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('accepts multiline message', () => {
      const validData = {
        message: 'Line 1\nLine 2\nLine 3\n\nParagraph 2'
      };

      const result = providerApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('rejects non-string message', () => {
      const invalidData = {
        message: 12345
      };

      const result = providerApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('reviewApplicationSchema', () => {
    it('accepts approved status', () => {
      const validData = {
        status: 'approved' as const
      };

      const result = reviewApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('approved');
      }
    });

    it('accepts rejected status', () => {
      const validData = {
        status: 'rejected' as const
      };

      const result = reviewApplicationSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe('rejected');
      }
    });

    it('rejects missing status', () => {
      const invalidData = {};

      const result = reviewApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects invalid status', () => {
      const invalidData = {
        status: 'pending'
      };

      const result = reviewApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects empty string status', () => {
      const invalidData = {
        status: ''
      };

      const result = reviewApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects null status', () => {
      const invalidData = {
        status: null
      };

      const result = reviewApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('rejects non-string status', () => {
      const invalidData = {
        status: 1
      };

      const result = reviewApplicationSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});