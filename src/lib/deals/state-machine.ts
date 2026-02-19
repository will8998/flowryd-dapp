import { ForbiddenError } from '@/lib/api/errors';
import type { UserRole } from '@/lib/auth/rbac';

type DealStatus = 'draft' | 'open' | 'negotiating' | 'locked' | 'committed';

// draft → open → negotiating → locked → committed
// any → draft (admin only, reset)
const TRANSITIONS: Record<DealStatus, { to: DealStatus[]; requiredRole: UserRole[] }> = {
  draft: { to: ['open'], requiredRole: ['admin', 'editor'] },
  open: { to: ['negotiating'], requiredRole: ['admin', 'editor'] },
  negotiating: { to: ['locked'], requiredRole: ['admin'] },
  locked: { to: ['committed'], requiredRole: ['admin'] },
  committed: { to: [], requiredRole: [] },
};

export function validateTransition(
  from: DealStatus,
  to: DealStatus,
  role: UserRole,
  participantCount: number,
): void {
  // Admin can always reset to draft
  if (to === 'draft' && from !== 'draft') {
    if (role !== 'admin') {
      throw new ForbiddenError('Only admins can reset deals to draft');
    }
    return;
  }

  const allowed = TRANSITIONS[from];
  if (!allowed.to.includes(to)) {
    throw new ForbiddenError(`Cannot transition from '${from}' to '${to}'`);
  }

  if (!allowed.requiredRole.includes(role)) {
    throw new ForbiddenError(`Role '${role}' cannot perform this transition`);
  }

  if (from === 'open' && to === 'negotiating' && participantCount < 2) {
    throw new ForbiddenError('At least 2 participants required to start negotiation');
  }
}
