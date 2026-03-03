import { ForbiddenError } from '@/lib/api/errors';

export type UserRole = 'admin' | 'editor' | 'viewer';

export type Permission =
  | 'flow.create'
  | 'flow.edit'
  | 'flow.delete'
  | 'flow.publish'
  | 'flow.manage_templates'
  | 'deal.create'
  | 'deal.status_change'
  | 'deal.send_message'
  | 'deal.upload_file'
  | 'deal.read_messages'
  | 'admin.manage_users'
  | 'admin.view_audit'
  | 'subscription.manage'
  | 'provider.apply';

const PERMISSION_MATRIX: Record<Permission, UserRole[]> = {
  'flow.create': ['admin', 'editor'],
  'flow.edit': ['admin', 'editor'],
  'flow.delete': ['admin', 'editor'],
  'flow.publish': ['admin', 'editor'],
  'flow.manage_templates': ['admin'],
  'deal.create': ['admin', 'editor', 'viewer'],
  'deal.status_change': ['admin', 'editor'],
  'deal.send_message': ['admin', 'editor'],
  'deal.upload_file': ['admin', 'editor'],
  'deal.read_messages': ['admin', 'editor', 'viewer'],
  'admin.manage_users': ['admin'],
  'admin.view_audit': ['admin'],
  'subscription.manage': ['admin'],
  'provider.apply': ['admin', 'editor'],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission].includes(role);
}

export function requirePermission(role: UserRole, permission: Permission): void {
  if (!hasPermission(role, permission)) {
    throw new ForbiddenError(`Permission '${permission}' requires role: ${PERMISSION_MATRIX[permission].join(' or ')}`);
  }
}
