import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/db', () => ({
  db: {
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    }),
  },
}));

vi.mock('@/db/schema', () => ({
  auditLog: 'audit_log_table',
}));

import { db } from '@/db';
import { auditLog } from '@/db/schema';
import { logAudit, extractRequestMeta } from '@/lib/audit';

const mockDb = vi.mocked(db);

describe('audit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAudit', () => {
    it('calls db.insert with correct params', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      mockDb.insert.mockReturnValue(mockInsert());

      const params = {
        userId: 'user123',
        orgId: 'org456',
        action: 'flow.create' as const,
        resourceType: 'document',
        resourceId: 'doc789',
        metadata: { title: 'Test Document' },
        ipAddress: '192.168.1.1',
        userAgent: 'TestBot/1.0',
      };

      await logAudit(params);

      expect(mockDb.insert).toHaveBeenCalledWith(auditLog);
      expect(mockInsert().values).toHaveBeenCalledWith({
        userId: 'user123',
        orgId: 'org456',
        action: 'flow.create',
        resourceType: 'document',
        resourceId: 'doc789',
        metadata: { title: 'Test Document' },
        ipAddress: '192.168.1.1',
        userAgent: 'TestBot/1.0',
      });
    });

    it('does not throw on db error', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockRejectedValue(new Error('Database error')),
      });
      mockDb.insert.mockReturnValue(mockInsert());

      const params = {
        action: 'flow.delete' as const,
        resourceType: 'user',
      };

      await expect(logAudit(params)).resolves.not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Audit log failed:', expect.any(Error));
      
      consoleErrorSpy.mockRestore();
    });

    it('sets metadata to null when not provided', async () => {
      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue(undefined),
      });
      mockDb.insert.mockReturnValue(mockInsert());

      const params = {
        userId: 'user123',
        action: 'flow.update' as const,
      };

      await logAudit(params);

      expect(mockInsert().values).toHaveBeenCalledWith({
        userId: 'user123',
        orgId: undefined,
        action: 'flow.update',
        resourceType: undefined,
        resourceId: undefined,
        metadata: null,
        ipAddress: undefined,
        userAgent: undefined,
      });
    });
  });

  describe('extractRequestMeta', () => {
    it('extracts IP from x-forwarded-for header', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.2.3.4' }
      });

      const result = extractRequestMeta(req);

      expect(result.ipAddress).toBe('1.2.3.4');
    });

    it('extracts user-agent header', () => {
      const req = new Request('http://localhost', {
        headers: { 'user-agent': 'TestBot/1.0' }
      });

      const result = extractRequestMeta(req);

      expect(result.userAgent).toBe('TestBot/1.0');
    });

    it('returns unknown when headers missing', () => {
      const req = new Request('http://localhost');

      const result = extractRequestMeta(req);

      expect(result.ipAddress).toBe('unknown');
      expect(result.userAgent).toBe('unknown');
    });

    it('takes first IP from comma-separated x-forwarded-for', () => {
      const req = new Request('http://localhost', {
        headers: { 'x-forwarded-for': '1.2.3.4, 5.6.7.8, 9.10.11.12' }
      });

      const result = extractRequestMeta(req);

      expect(result.ipAddress).toBe('1.2.3.4');
    });
  });
});