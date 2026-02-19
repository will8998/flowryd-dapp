import { db } from '@/db';
import { auditLog } from '@/db/schema';
import type { InferInsertModel } from 'drizzle-orm';

type AuditAction = InferInsertModel<typeof auditLog>['action'];

interface AuditParams {
  userId?: string;
  orgId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function logAudit(params: AuditParams): Promise<void> {
  try {
    await db.insert(auditLog).values({
      userId: params.userId,
      orgId: params.orgId,
      action: params.action,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      metadata: params.metadata ?? null,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    });
  } catch (error) {
    console.error('Audit log failed:', error);
  }
}

export function extractRequestMeta(req: Request): { ipAddress: string; userAgent: string } {
  return {
    ipAddress: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
  };
}
