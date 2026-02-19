import { describe, it, expect } from 'vitest';
import { hasPermission, requirePermission } from '@/lib/auth/rbac';

describe('hasPermission', () => {
  it('admin has all permissions', () => {
    expect(hasPermission('admin', 'flow.create')).toBe(true);
    expect(hasPermission('admin', 'flow.manage_templates')).toBe(true);
    expect(hasPermission('admin', 'deal.create')).toBe(true);
    expect(hasPermission('admin', 'admin.manage_users')).toBe(true);
    expect(hasPermission('admin', 'admin.view_audit')).toBe(true);
  });

  it('editor can create/edit flows and send messages', () => {
    expect(hasPermission('editor', 'flow.create')).toBe(true);
    expect(hasPermission('editor', 'flow.edit')).toBe(true);
    expect(hasPermission('editor', 'flow.publish')).toBe(true);
    expect(hasPermission('editor', 'deal.send_message')).toBe(true);
    expect(hasPermission('editor', 'deal.upload_file')).toBe(true);
  });

  it('editor cannot manage templates or users', () => {
    expect(hasPermission('editor', 'flow.manage_templates')).toBe(false);
    expect(hasPermission('editor', 'deal.create')).toBe(false);
    expect(hasPermission('editor', 'admin.manage_users')).toBe(false);
    expect(hasPermission('editor', 'admin.view_audit')).toBe(false);
  });

  it('viewer can only read', () => {
    expect(hasPermission('viewer', 'deal.read_messages')).toBe(true);
    expect(hasPermission('viewer', 'flow.create')).toBe(false);
    expect(hasPermission('viewer', 'deal.send_message')).toBe(false);
    expect(hasPermission('viewer', 'deal.create')).toBe(false);
    expect(hasPermission('viewer', 'admin.manage_users')).toBe(false);
  });
});

describe('requirePermission', () => {
  it('does not throw for permitted actions', () => {
    expect(() => requirePermission('admin', 'flow.create')).not.toThrow();
    expect(() => requirePermission('editor', 'flow.edit')).not.toThrow();
  });

  it('throws ForbiddenError for unpermitted actions', () => {
    expect(() => requirePermission('viewer', 'flow.create')).toThrow();
    expect(() => requirePermission('editor', 'admin.manage_users')).toThrow();
  });
});
