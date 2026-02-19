import { describe, it, expect } from 'vitest';
import { hasPermission, requirePermission, type UserRole, type Permission } from '@/lib/auth/rbac';

describe('RBAC permission matrix', () => {
  const ALL_ROLES: UserRole[] = ['admin', 'editor', 'viewer'];

  const ALL_PERMISSIONS: Permission[] = [
    'flow.create',
    'flow.edit',
    'flow.delete',
    'flow.publish',
    'flow.manage_templates',
    'deal.create',
    'deal.status_change',
    'deal.send_message',
    'deal.upload_file',
    'deal.read_messages',
    'admin.manage_users',
    'admin.view_audit',
  ];

  describe('admin has all permissions', () => {
    it.each(ALL_PERMISSIONS)('admin has %s', (permission) => {
      expect(hasPermission('admin', permission)).toBe(true);
    });
  });

  describe('viewer restrictions', () => {
    const VIEWER_ALLOWED: Permission[] = ['deal.read_messages'];
    const VIEWER_DENIED = ALL_PERMISSIONS.filter(p => !VIEWER_ALLOWED.includes(p));

    it.each(VIEWER_ALLOWED)('viewer has %s', (permission) => {
      expect(hasPermission('viewer', permission)).toBe(true);
    });

    it.each(VIEWER_DENIED)('viewer does NOT have %s', (permission) => {
      expect(hasPermission('viewer', permission)).toBe(false);
    });
  });

  describe('editor permissions', () => {
    const EDITOR_ALLOWED: Permission[] = [
      'flow.create', 'flow.edit', 'flow.delete', 'flow.publish',
      'deal.status_change', 'deal.send_message', 'deal.upload_file', 'deal.read_messages',
    ];
    const EDITOR_DENIED = ALL_PERMISSIONS.filter(p => !EDITOR_ALLOWED.includes(p));

    it.each(EDITOR_ALLOWED)('editor has %s', (permission) => {
      expect(hasPermission('editor', permission)).toBe(true);
    });

    it.each(EDITOR_DENIED)('editor does NOT have %s', (permission) => {
      expect(hasPermission('editor', permission)).toBe(false);
    });
  });

  describe('requirePermission throws correctly', () => {
    it('does not throw when permission exists', () => {
      expect(() => requirePermission('admin', 'admin.manage_users')).not.toThrow();
    });

    it('throws ForbiddenError when permission denied', () => {
      expect(() => requirePermission('viewer', 'flow.create')).toThrow();
      expect(() => requirePermission('editor', 'admin.manage_users')).toThrow();
    });

    it('error message contains required roles', () => {
      try {
        requirePermission('viewer', 'deal.create');
      } catch (e) {
        expect((e as Error).message).toContain('admin');
      }
    });
  });
});
