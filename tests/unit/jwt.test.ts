/**
 * @vitest-environment node
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { webcrypto } from 'crypto';
import {
  signAccessToken,
  verifyAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  type AccessTokenPayload,
  type RefreshTokenPayload,
} from '@/lib/auth/jwt';

// Setup crypto for Node.js environment
Object.defineProperty(globalThis, 'crypto', {
  value: webcrypto,
});

describe('JWT functions', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key-for-access-tokens',
      JWT_REFRESH_SECRET: 'test-secret-key-for-refresh-tokens',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('signAccessToken', () => {
    it('returns a string JWT', async () => {
      const payload: AccessTokenPayload = {
        sub: 'user123',
        partyId: 'party456',
        role: 'admin',
        orgId: 'org789',
      };

      const token = await signAccessToken(payload);
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyAccessToken', () => {
    it('correctly decodes payload fields', async () => {
      const payload: AccessTokenPayload = {
        sub: 'user123',
        partyId: 'party456',
        role: 'editor',
        orgId: 'org789',
      };

      const token = await signAccessToken(payload);
      const decoded = await verifyAccessToken(token);

      expect(decoded.sub).toBe('user123');
      expect(decoded.partyId).toBe('party456');
      expect(decoded.role).toBe('editor');
      expect(decoded.orgId).toBe('org789');
    });

    it('throws on invalid token', async () => {
      await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow();
    });

    it('throws when using wrong secret', async () => {
      const payload: AccessTokenPayload = {
        sub: 'user123',
        partyId: 'party456',
        role: 'viewer',
        orgId: 'org789',
      };

      const token = await signAccessToken(payload);
      
      // Change the secret to simulate wrong secret
      process.env.JWT_SECRET = 'wrong-secret';
      
      await expect(verifyAccessToken(token)).rejects.toThrow();
    });
  });

  describe('signRefreshToken and verifyRefreshToken', () => {
    it('round-trip works correctly', async () => {
      const userId = 'user123';
      const tokenFamily = 'family456';

      const token = await signRefreshToken(userId, tokenFamily);
      const decoded = await verifyRefreshToken(token);

      expect(decoded.sub).toBe(userId);
      expect(decoded.tokenFamily).toBe(tokenFamily);
    });

    it('throws when using wrong secret for refresh token', async () => {
      const token = await signRefreshToken('user123', 'family456');
      
      // Try to verify refresh token with access token secret
      process.env.JWT_REFRESH_SECRET = process.env.JWT_SECRET!;
      
      await expect(verifyRefreshToken(token)).rejects.toThrow();
    });
  });

  describe('hashToken', () => {
    it('returns a 64-char hex string', async () => {
      const token = 'test-token-123';
      const hash = await hashToken(token);

      expect(typeof hash).toBe('string');
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[0-9a-f]{64}$/);
    });

    it('is deterministic (same input = same output)', async () => {
      const token = 'test-token-123';
      const hash1 = await hashToken(token);
      const hash2 = await hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('produces different output for different inputs', async () => {
      const hash1 = await hashToken('token1');
      const hash2 = await hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('missing environment variables', () => {
    it('throws error with descriptive message for missing JWT_SECRET', async () => {
      delete process.env.JWT_SECRET;
      process.env.JWT_REFRESH_SECRET = 'refresh-secret';

      const payload: AccessTokenPayload = {
        sub: 'user123',
        partyId: 'party456',
        role: 'admin',
        orgId: 'org789',
      };

      await expect(signAccessToken(payload)).rejects.toThrow('Missing environment variable: JWT_SECRET');
    });

    it('throws error with descriptive message for missing JWT_REFRESH_SECRET', async () => {
      process.env.JWT_SECRET = 'access-secret';
      delete process.env.JWT_REFRESH_SECRET;

      await expect(signRefreshToken('user123', 'family456')).rejects.toThrow('Missing environment variable: JWT_REFRESH_SECRET');
    });
  });
});