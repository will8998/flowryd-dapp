# Flowryd SOW Execution Plan — M1 + M2

> **Version**: 2.5 (Strike-Team Optimized)
> **Date**: February 19, 2026
> **Status**: Ready for Execution
> **For**: Any agent continuing this work

---

## Quick Start for Agents

**READ `ARCHITECTURE.md` FIRST.** It contains all architecture decisions, database schema, and upgrade paths.

This document is the **task execution plan**. Each task has:
- Clear dependencies
- Files to create/modify
- Category + skills for agent delegation
- Acceptance criteria

### Current Progress

Check the TODO list in the session or the git log to see what's been completed.

---

## Environment Setup Required

Before ANY task execution:

```bash
# 1. Ensure .env.local exists with:
DATABASE_URL=postgresql://...@neon.tech/flowryd?sslmode=require
JWT_SECRET=<64-char-hex>
JWT_REFRESH_SECRET=<64-char-hex>
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 2. Ensure packages are installed (see T01)
# 3. Ensure DB migrations are applied (see T02)
```

---

## Task Dependency Graph

```
WAVE 0: [T01] [T02] [T03] — All parallel, no deps
         │      │
WAVE 1: [T04] [T05] [T06] [T07] — Depend on T01
         │      │     │      │
WAVE 2: [T08] [T09] [T10] [T11] [T12] — Depend on Wave 0+1
         │      │                  │
WAVE 3: [T13] [T14] [T15] [T16] [T17] — Depend on Wave 2
                       │
WAVE 4: [T18] ──→ [T19] [T20] [T21] — Depend on Wave 2-3
         │          │     │
WAVE 5: [T22] [T23] [T24] [T25] [T26] — Depend on Wave 4
         │
WAVE 6: [T27] ──→ [T28] [T29] [T30] [T31] — Depend on Wave 2
                    │     │     │
WAVE 7: [T32] [T33] [T34] [T35] [T36] [T37] — Depend on Wave 6
         │
WAVE 8: [T38] [T39] [T40] [T41] — Depend on prior waves
         │
WAVE 9: [T42] [T43] [T44] [T45] — Integration wiring
         │
WAVE 10: [T46] [T47] [T48] [T49] — Testing
```

---

## WAVE 0: Foundation

### T01 — Project Setup
**Complexity**: S | **Category**: `quick` | **Skills**: none

**What to do**:
1. Install production packages:
```bash
npm install drizzle-orm @neondatabase/serverless jose zod @vercel/blob bcryptjs nanoid cookie server-only
```
2. Install dev packages:
```bash
npm install -D drizzle-kit dotenv @types/bcryptjs @types/cookie vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom @playwright/test tsx
```
3. Create `.env.example` (see ARCHITECTURE.md §11)
4. Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```
5. Create `playwright.config.ts` with base URL `http://localhost:3000`
6. Update `tsconfig.json` if needed for test paths

**Acceptance**: `npm run build` still passes. New packages in `package.json`.

---

### T02 — Database Schema + Drizzle Config
**Complexity**: XL | **Category**: `deep` | **Skills**: none

**What to do**:
1. Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL! },
});
```

2. Create `src/db/schema.ts` with ALL 13 tables (see ARCHITECTURE.md §4):
   - `organizations`, `users`, `refreshTokens`, `flows`, `flowVersions`, `flowParticipants`
   - `deals`, `dealParticipants`, `messages`, `joinRequests`, `auditLog`, `activeSessions`, `nodeApiConfigs`
   - All enums: `userRole`, `dealStatus`, `flowStatus`, `auditAction`, `joinRequestStatus`
   - All indices

3. Create `src/db/relations.ts` with Drizzle relation definitions

4. Create `src/db/index.ts`:
```typescript
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });
```

5. Generate migrations: `npx drizzle-kit generate`
6. Apply to Neon: `npx drizzle-kit push` (for dev) or `npx drizzle-kit migrate` (for prod)

**Acceptance**: All 13 tables exist in Neon. `npx drizzle-kit check` passes. TypeScript types compile.

---

### T03 — Architecture Documentation
**Complexity**: M | **Category**: `writing` | **Skills**: none

**What to do**: Already created as `ARCHITECTURE.md`. Review and update if any decisions changed during T01/T02.

**Acceptance**: `ARCHITECTURE.md` is accurate and reflects current implementation.

---

## WAVE 1: Auth Core

### T04 — JWT Utilities
**Complexity**: M | **Category**: `deep` | **Skills**: none

**Files to create**:
- `src/lib/auth/jwt.ts` — Sign and verify access + refresh tokens using `jose`
- `src/lib/auth/session.ts` — Cookie get/set/delete helpers, `getSession()` function

**Key implementation details**:
```typescript
// jwt.ts
import { SignJWT, jwtVerify } from 'jose';

interface AccessTokenPayload {
  sub: string;       // userId
  partyId: string;
  role: 'admin' | 'editor' | 'viewer';
  orgId: string;
}

export async function signAccessToken(payload: AccessTokenPayload): Promise<string>
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload>
export async function signRefreshToken(userId: string, tokenFamily: string): Promise<string>
export async function verifyRefreshToken(token: string): Promise<{ sub: string; tokenFamily: string }>
```

```typescript
// session.ts
import { cookies } from 'next/headers';

export async function getSession(): Promise<AccessTokenPayload | null>
export function setAuthCookies(accessToken: string, refreshToken: string): void
export function clearAuthCookies(): void
```

**Acceptance**: Unit tests pass for sign/verify/expire scenarios.

---

### T05 — Canton Party-ID Validator
**Complexity**: S | **Category**: `quick` | **Skills**: none

**File**: `src/lib/auth/validate-party-id.ts`

```typescript
// Validates Canton Party-ID format: orgname::identifier
// Pattern: /^[a-z][a-z0-9_-]{0,62}::[a-z0-9_-]{1,62}$/i
export function validatePartyId(partyId: string): { valid: boolean; org?: string; identifier?: string; error?: string }
```

**Acceptance**: Handles edge cases (empty, no ::, invalid chars, too long). Unit tests.

---

### T06 — Zod Validation Schemas
**Complexity**: M | **Category**: `quick` | **Skills**: none

**Files**:
- `src/lib/validators/auth.ts` — loginSchema, registerSchema
- `src/lib/validators/flows.ts` — createFlowSchema, updateFlowSchema, saveVersionSchema
- `src/lib/validators/deals.ts` — createDealSchema, updateDealStatusSchema, addParticipantSchema
- `src/lib/validators/messages.ts` — sendMessageSchema

**Each schema**: Zod object with strict validation. Export both schema + inferred type.

**Acceptance**: All schemas compile. Edge cases tested.

---

### T07 — API Error Handling + Response Helpers
**Complexity**: M | **Category**: `quick` | **Skills**: none

**Files**:
- `src/lib/api/errors.ts`:
```typescript
export class ApiError extends Error {
  constructor(public code: string, message: string, public status: number, public details?: unknown)
}
export class NotFoundError extends ApiError { ... }
export class UnauthorizedError extends ApiError { ... }
export class ForbiddenError extends ApiError { ... }
export class ValidationError extends ApiError { ... }
```

- `src/lib/api/response.ts`:
```typescript
export function successResponse<T>(data: T, status?: number): NextResponse
export function errorResponse(error: ApiError): NextResponse
export function paginatedResponse<T>(data: T[], cursor: string | null, hasMore: boolean): NextResponse
```

- `src/lib/api/middleware-chain.ts`:
```typescript
// Composable middleware for Next.js route handlers
export function withMiddleware(...middlewares: Middleware[]): NextRouteHandler
export function validateBody<T>(schema: ZodSchema<T>): Middleware
export function requireAuth(): Middleware
export function requireRole(...roles: UserRole[]): Middleware
export function auditLog(action: AuditAction): Middleware
```

**Acceptance**: Error handler produces correct HTTP status codes. Middleware chain composes correctly.

---

## WAVE 2: Auth API + Middleware

### T08 — Registration API
**Complexity**: L | **Category**: `deep` | **Skills**: none
**Depends**: T02, T04, T05, T06, T07

**File**: `src/app/api/auth/register/route.ts`

**Logic**:
1. Validate body with `registerSchema` (displayName, partyId, orgName, email?)
2. Validate Party-ID format
3. Check if Party-ID already exists → 409 Conflict
4. Create organization (or find existing by name)
5. Count users in org → if 0, role = 'admin'; else role = 'viewer'
6. Create user
7. Issue JWT tokens (access + refresh)
8. Set httpOnly cookies
9. Log audit: `user.register`
10. Return user profile

**Acceptance**: Can register new user. First user is admin. Second user is viewer. Duplicate Party-ID rejected.

---

### T09 — Login API
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T02, T04, T05, T06, T07

**File**: `src/app/api/auth/login/route.ts`

**Logic**:
1. Validate body with `loginSchema` (partyId)
2. Validate Party-ID format
3. Look up user by party_id
4. If not found → 401 with `{ redirect: '/register' }`
5. Update last_login_at
6. Issue JWT tokens
7. Set httpOnly cookies
8. Log audit: `user.login`
9. Return user profile

**Acceptance**: Known user can log in. Unknown Party-ID returns 401. Tokens set in cookies.

---

### T10 — Refresh + Logout API
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T04, T02

**Files**:
- `src/app/api/auth/refresh/route.ts`
- `src/app/api/auth/logout/route.ts`

**Refresh logic**: Verify refresh token → check hash in DB → if valid, issue new pair + revoke old → if reuse detected, revoke entire family.
**Logout logic**: Revoke all refresh tokens for user. Clear cookies. Log audit.

**Acceptance**: Token rotation works. Reuse detection triggers family revocation. Logout clears all tokens.

---

### T11 — Next.js Middleware
**Complexity**: L | **Category**: `deep` | **Skills**: none
**Depends**: T04

**File**: `src/middleware.ts`

**Logic**:
1. Match against public paths → allow through
2. Get access token from cookies
3. Verify JWT → if invalid, redirect to /login
4. Inject user info into request headers (x-user-id, x-user-role, x-user-org-id, x-user-party-id)
5. For API routes: let through (API handlers do their own RBAC)
6. For app routes: redirect unauthenticated to /login

**Matcher config**:
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)'],
};
```

**Acceptance**: Unauthenticated users redirected to /login. Authenticated users pass through. Headers injected correctly.

---

### T12 — RBAC Utility + Role Guards
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T04, T02

**Files**:
- `src/lib/auth/rbac.ts`:
```typescript
export type Permission = 'flow.create' | 'flow.edit' | 'flow.delete' | 'flow.publish' | 'flow.manage_templates' |
  'deal.create' | 'deal.status_change' | 'deal.send_message' | 'deal.upload_file' |
  'admin.manage_users' | 'admin.view_audit';

export function hasPermission(role: UserRole, permission: Permission): boolean
export function requirePermission(role: UserRole, permission: Permission): void  // throws ForbiddenError
```

- `src/components/auth/RoleGuard.tsx`:
```typescript
export function RoleGuard({ roles, children, fallback }: { roles: UserRole[], children: ReactNode, fallback?: ReactNode })
```

**Acceptance**: Permission matrix matches ARCHITECTURE.md §3 ADR-002. Client guard hides UI elements for unauthorized roles.

---

## WAVE 3: Auth Frontend + Audit

### T13 — Login Page
**Complexity**: M | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`
**Depends**: T09

**Files**:
- `src/app/(auth)/login/page.tsx`
- `src/components/auth/LoginForm.tsx`

**Design**: Match existing dark theme from current `page.tsx` (the Canton Party-ID input). Reuse the terminal-style input with `Flowryd OS` branding. Add error states, loading spinner. Link to /register for new users.

**Acceptance**: Login works end-to-end. Error messages display. Redirects to /studio on success. Matches existing visual style.

---

### T14 — Registration Page
**Complexity**: L | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`
**Depends**: T08

**Files**:
- `src/app/(auth)/register/page.tsx`
- `src/components/auth/RegisterForm.tsx`

**Design**: Multi-step form (similar to existing onboarding page style):
1. Step 1: Organization name + Party-ID
2. Step 2: Display name + email (optional)
3. Step 3: Confirmation + connect

Match dark theme with glassmorphism cards. Progress indicator.

**Acceptance**: Registration creates org + user. First user is admin. Redirects to /studio.

---

### T15 — Refactor auth-context.tsx
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T09, T11

**File**: `src/lib/auth-context.tsx` [MODIFY]

**Changes**:
- Replace localStorage with cookie-based JWT
- Add `user` object: `{ id, partyId, role, orgId, displayName }`
- Add `isLoading` state (fetches /api/auth/me on mount)
- Keep backward-compatible `isConnected`, `partyId` (derive from user)
- `connect()` → calls login API
- `disconnect()` → calls logout API

**CRITICAL**: Must not break existing components that use `useCantonAuth()`. Add new fields, don't remove old ones.

**Acceptance**: Existing FlowsStudio still renders. Auth state persists across page refreshes. Role available in context.

---

### T16 — Audit Logging
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T02, T07

**Files**:
- `src/lib/audit.ts`:
```typescript
export async function logAudit(params: {
  userId?: string;
  orgId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void>
```

- `src/app/api/admin/audit/route.ts`:
  - GET: Query audit logs with filters (action, userId, dateRange, resourceType)
  - Paginated with cursor
  - Admin only

**Acceptance**: Audit entries written to DB. Admin can query. Non-admins get 403.

---

### T17 — Session Hook + Me Endpoint
**Complexity**: M | **Category**: `deep` | **Skills**: none
**Depends**: T11, T04

**Files**:
- `src/app/api/auth/me/route.ts` — Returns current user profile from JWT
- `src/hooks/use-session.ts` — Client hook that fetches /api/auth/me

```typescript
// use-session.ts
export function useSession(): {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  mutate: () => void;  // re-fetch
}
```

**Acceptance**: Hook returns user data. Loading state works. Returns null when not authenticated.

---

## WAVES 4-10: See ARCHITECTURE.md for full details

Each subsequent wave follows the same pattern. Key guidance for agents:

### Wave 4 (Flows API) — Category: `deep`
- T18: Full CRUD with org-scoping + role checks
- T19: Version save = insert new row with current nodes/edges
- T20: Publish = status change, templates = admin-only flag
- T21: Join = create join_request, admin approves/rejects

### Wave 5 (Flows Frontend) — Category: `visual-engineering`, Skills: `frontend-ui-ux`
- T23 is the most critical: Wire NavigateHub to save/load via API
- T24: WorkbenchCanvas gets `readOnly` prop for viewers
- T25: Admin sees TemplateManager tab in FlowsStudio

### Wave 6 (Deals API) — Category: `deep`
- T27 (XL): Deal state machine with transition validation is the hardest API task
- T30: SSE uses ReadableStream in Route Handler

### Wave 7 (Deal Room Frontend) — Category: `visual-engineering`, Skills: `frontend-ui-ux`
- T34 (XL): MessageThread + MessageInput is the largest frontend component
- Must match existing dark institutional theme
- Thread replies: click message to reply → shows in-thread

### Wave 8 (Admin + Marketplace) — Category: `deep` + `visual-engineering`
- T40: CollectiveHub gets real public flows + join button
- T41: Node API proxy is a simple passthrough

### Wave 9 (Wiring) — Category: `quick`
- T42: Root page.tsx becomes a redirect
- T43: App layout wraps authenticated pages
- T44: Seed script creates test data for development

### Wave 10 (Testing) — Category: `deep`, Skills: `playwright`
- T46: Unit tests for auth, validators, audit (Vitest)
- T47: Integration tests with real DB (Vitest + test Neon branch)
- T48: E2E tests for critical flows (Playwright)
- T49: Ensure `npm run build` + `npm run test` + `npm run test:e2e` all pass

---

## Agent Delegation Reference

| Wave | Best Category | Skills | Notes |
|------|--------------|--------|-------|
| 0 | `quick` (T01), `deep` (T02), `writing` (T03) | — | T02 is XL, dedicate full attention |
| 1 | `deep` (T04), `quick` (T05,T06,T07) | — | Can parallelize all 4 |
| 2 | `deep` | — | Auth is security-critical, careful impl |
| 3 | `visual-engineering` (T13,T14), `deep` (T15,T16,T17) | `frontend-ui-ux` | 2 parallel streams |
| 4 | `deep` | — | All API work |
| 5 | `visual-engineering` | `frontend-ui-ux` | All frontend work |
| 6 | `deep` | — | State machine is complex (T27) |
| 7 | `visual-engineering` | `frontend-ui-ux` | Chat UI is complex (T34) |
| 8 | Mixed | — | Admin + marketplace |
| 9 | `quick` | — | Wiring tasks |
| 10 | `deep` (T46,T47), `visual-engineering` (T48) | `playwright` | Full test suite |

---

## Critical Reminders

1. **NEVER store JWT in localStorage** — always httpOnly cookies
2. **NEVER use `as any`** — strict TypeScript throughout
3. **ALWAYS scope data by org_id** — multi-tenant from day one
4. **ALWAYS log audit events** — compliance requirement
5. **ALWAYS validate with Zod** — never trust client input
6. **Match the existing dark theme** — institutional aesthetic (bg-[#020202], blue-500 accent, white/40 muted text)
7. **Keep the existing pages working** — /discover, /demo, /onboarding, /media-kit are UNCHANGED
8. **Test the critical path** — login → create flow → save → create deal → send message
9. **Database migrations** — use `drizzle-kit generate`, never `push` in production
10. **M3 upgrade** — design for zero frontend changes when Canton ledger integration comes

---

## Definition of Done (M2)

- [ ] Live Login Flow: Canton Party-ID format validation + "Connect to Canton" UI
- [ ] User Registration: Multi-step registration with org creation
- [ ] RBAC: Admin/Editor/Viewer roles enforced on all endpoints + UI
- [ ] JWT Sessions: httpOnly cookies, refresh rotation, secure logout
- [ ] Flow Builder: Save/load flow configurations to PostgreSQL
- [ ] Flow Versioning: Append-only version history
- [ ] Flow Templates: Admin can create/manage templates
- [ ] Deal Rooms: Create, manage participants, state machine transitions
- [ ] Chat: Real-time messaging with SSE + polling fallback
- [ ] File Upload: Vercel Blob integration in deal rooms
- [ ] Audit Trail: All actions logged to PostgreSQL
- [ ] Marketplace: Public flows + join requests
- [ ] Admin Panel: User management + audit viewer
- [ ] Tests: Unit + integration + E2E all passing
- [ ] Build: `npm run build` clean, no TypeScript errors
