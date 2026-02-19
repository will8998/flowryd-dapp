'use client';

import { type ReactNode } from 'react';
import { useCantonAuth } from '@/lib/auth-context';
import { hasPermission, type UserRole, type Permission } from '@/lib/auth/rbac';

interface RoleGuardProps {
  roles?: UserRole[];
  permission?: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}

export function RoleGuard({ roles, permission, children, fallback = null }: RoleGuardProps) {
  const { user } = useCantonAuth();

  if (!user) {
    return fallback;
  }

  const userRole = (user as { role?: UserRole }).role;

  if (!userRole) {
    return fallback;
  }

  if (roles && !roles.includes(userRole)) {
    return fallback;
  }

  if (permission && !hasPermission(userRole, permission)) {
    return fallback;
  }

  return children;
}
