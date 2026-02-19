# Flowryd Architecture Document

> **Version**: 2.0 (M1/M2 Alpha)
> **Date**: February 19, 2026
> **Status**: Active Development
> **Author**: Gravity Core LLC

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [Architecture Decisions](#3-architecture-decisions)
4. [Database Schema](#4-database-schema)
5. [Authentication & Authorization](#5-authentication--authorization)
6. [API Architecture](#6-api-architecture)
7. [Real-Time Architecture](#7-real-time-architecture)
8. [File Storage](#8-file-storage)
9. [Frontend Architecture](#9-frontend-architecture)
10. [Upgrade Paths (M3+)](#10-upgrade-paths-m3)
11. [Environment Configuration](#11-environment-configuration)
12. [Security Considerations](#12-security-considerations)

---

## 1. System Overview

Flowryd is an **institutional SaaS platform** for the Canton Network — enabling multi-party workflow orchestration through a three-stage pipeline:

```
DISCOVER → NAVIGATE → ACTIVATE
(Find partners)  (Build flows)  (Execute deals)
```

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        VERCEL EDGE                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  middleware.ts (JWT validation, route protection)      │   │
│  └──────────────────────────────────────────────────────┘   │
│                              │                               │
│  ┌──────────────────┐  ┌─────────────┐  ┌──────────────┐   │
│  │  Next.js Pages   │  │  API Routes │  │  SSE Stream  │   │
│  │  (React 19 SSR)  │  │  (REST)     │  │  (Real-time) │   │
│  └──────────────────┘  └──────┬──────┘  └──────┬───────┘   │
│                               │                 │            │
│  ┌────────────────────────────┴─────────────────┘           │
│  │         Drizzle ORM (Type-safe query layer)              │
│  └────────────────────────────┬──────────────────           │
│                               │                              │
└───────────────────────────────┼──────────────────────────────┘
                                │ HTTP (neon-http driver)
                    ┌───────────┴───────────┐
                    │   Neon PostgreSQL      │
                    │   (Serverless)         │
                    └───────────────────────┘

External Services:
  ├── Vercel Blob (file storage)
  └── Node API (Canton Network integration — per-org configured)
```

---

## 2. Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Framework** | Next.js | 15.x | App Router, React Server Components, edge middleware |
| **Runtime** | React | 19.x | Server components, transitions, concurrent features |
| **Language** | TypeScript | 5.x | Strict mode enabled |
| **Styling** | Tailwind CSS | 4.x | Utility-first, `@theme` inline system |
| **Animation** | Framer Motion | 12.x | Page transitions, micro-interactions |
| **Flow Canvas** | @xyflow/react | 12.x | Drag-and-drop workflow builder |
| **Database** | PostgreSQL (Neon) | 16.x | Serverless, scales-to-zero, branching |
| **ORM** | Drizzle ORM | Latest | Type-safe, edge-compatible, SQL-like |
| **DB Driver** | @neondatabase/serverless | Latest | HTTP transport for Vercel serverless |
| **Auth** | Custom JWT (jose) | Latest | Edge-compatible, no external dependencies |
| **Validation** | Zod | Latest | Runtime + compile-time validation |
| **File Storage** | Vercel Blob | Latest | CDN-backed, serverless |
| **Icons** | Lucide React | Latest | Tree-shakeable icon library |
| **Testing** | Vitest + Playwright | Latest | Unit/integration + E2E |

### Why These Choices

- **Drizzle over Prisma**: No codegen step, smaller bundle, edge runtime compatible, native TypeScript inference. Critical for Vercel middleware JWT validation.
- **jose over jsonwebtoken**: Works in edge runtime (V8 isolates). jsonwebtoken requires Node.js crypto module.
- **Neon over Supabase**: We need raw PostgreSQL control. Supabase adds opinions we don't need (its own auth, row-level security). Neon gives us clean PostgreSQL.
- **SSE over WebSocket**: Vercel serverless doesn't support persistent WebSocket connections. SSE works within serverless function lifetime limits with polling fallback.
- **Custom JWT over NextAuth**: Canton Party-ID is our identity primitive. NextAuth adds OAuth complexity we don't need and doesn't support custom identity schemes cleanly.

---

## 3. Architecture Decisions

### ADR-001: Custom JWT Authentication

**Context**: Canton Network uses Party-IDs (`orgname::identifier`) as identity primitives. Standard OAuth/OIDC flows don't apply.

**Decision**: Custom JWT implementation using `jose` library.

**Details**:
- Access token: 15-minute expiry, contains `{ sub, partyId, role, orgId }`
- Refresh token: 7-day expiry, stored as SHA-256 hash in DB
- Token rotation: Each refresh invalidates old token, issues new pair
- Reuse detection: If a revoked token is presented, entire token family is invalidated
- Storage: httpOnly, secure, sameSite=lax cookies (NOT localStorage)

**Upgrade Path (M3)**: Replace format-based Party-ID validation with cryptographic verification against Canton ledger. JWT claims can be extended with ledger-verified fields.

### ADR-002: Role-Based Access Control (RBAC)

**Context**: Three user roles with distinct permissions across all modules.

**Decision**: Simple role enum with permission matrix, enforced at API + middleware + component levels.

**Permission Matrix**:

| Resource | Admin | Editor | Viewer |
|----------|-------|--------|--------|
| **Flows** - Create/Edit/Delete | ✅ | ✅ | ❌ |
| **Flows** - View | ✅ | ✅ | ✅ |
| **Flows** - Publish | ✅ | ✅ | ❌ |
| **Flows** - Manage Templates | ✅ | ❌ | ❌ |
| **Deals** - Create Room | ✅ | ❌ | ❌ |
| **Deals** - Change Status | ✅ | ✅ | ❌ |
| **Deals** - Send Messages | ✅ | ✅ | ❌ |
| **Deals** - Upload Files | ✅ | ✅ | ❌ |
| **Deals** - Read Messages | ✅ | ✅ | ✅ |
| **Users** - Manage Roles | ✅ | ❌ | ❌ |
| **Audit** - View Logs | ✅ | ❌ | ❌ |

**Upgrade Path (M3)**: Extend to per-deal role overrides (a user could be Admin globally but Editor in a specific deal). The `deal_participants.role` column already supports this.

### ADR-003: SSE + Polling for Real-Time

**Context**: Vercel serverless functions have execution time limits (10s default, 60s max on Pro). WebSockets require persistent connections.

**Decision**: Server-Sent Events (SSE) with polling fallback.

**Details**:
- SSE endpoint: `GET /api/deals/[dealId]/messages/stream`
- Uses `ReadableStream` in Next.js Route Handler
- Heartbeat every 15 seconds to keep connection alive
- Client automatically reconnects on disconnect (EventSource API)
- Polling fallback: If SSE fails, client falls back to 3-second polling interval
- Presence tracking: `active_sessions` table tracks who's online

**Upgrade Path (M3)**: Migrate to dedicated WebSocket server (separate from Vercel) or use managed service (Pusher/Ably) when scale demands it. The SSE hook (`use-sse.ts`) abstracts the transport — swapping to WebSocket requires only changing the hook implementation, not the consuming components.

### ADR-004: Database Connection Strategy

**Context**: Neon provides both WebSocket and HTTP-based drivers. Vercel serverless creates new function instances per request.

**Decision**: Use `@neondatabase/serverless` with HTTP transport via `drizzle-orm/neon-http`.

**Details**:
- HTTP transport: No connection pooling needed (each request is stateless)
- Cold start: ~100-150ms (acceptable for alpha)
- Connection string: Standard PostgreSQL URL with `?sslmode=require`
- No pgBouncer needed (Neon handles connection multiplexing)

**Upgrade Path**: If latency becomes an issue, switch to WebSocket driver (`neon-serverless` with `ws` adapter) for connection reuse, or add PgBouncer for high-concurrency scenarios.

### ADR-005: Flow Versioning Strategy

**Context**: Flows need draft saving and version history for institutional audit requirements.

**Decision**: Append-only version table with JSON snapshots.

**Details**:
- Each save creates a new `flow_versions` row with `nodes` and `edges` as JSONB
- Auto-increment `version` per flow
- Optional `snapshot_name` for labeled versions
- Latest version is always `MAX(version)` for a given flow
- No destructive updates — full audit trail of all flow states

**Upgrade Path (M3)**: Add diff computation between versions, visual diff viewer, version restore with conflict resolution.

---

## 4. Database Schema

### Entity Relationship Diagram (Text)

```
organizations ─────┬──── users ──── refresh_tokens
                    │       │
                    │       ├──── flows ──── flow_versions
                    │       │       │
                    │       │       ├──── flow_participants
                    │       │       ├──── join_requests
                    │       │       │
                    │       │       └──── deals ──── deal_participants
                    │       │               │
                    │       │               ├──── messages (self-ref threads)
                    │       │               └──── active_sessions
                    │       │
                    │       └──── audit_log
                    │
                    └──── node_api_configs
```

### Tables Summary (13 total)

| Table | Purpose | Key Relations |
|-------|---------|---------------|
| `organizations` | Multi-tenant org container | Parent of users, flows, deals |
| `users` | Authenticated users with Canton Party-IDs | Belongs to org, has role |
| `refresh_tokens` | JWT refresh token storage + rotation | Belongs to user |
| `flows` | Workflow definitions (draft/published/archived) | Belongs to org, created by user |
| `flow_versions` | Append-only version snapshots (nodes/edges as JSONB) | Belongs to flow |
| `flow_participants` | Which Canton participants are in a flow | Belongs to flow |
| `deals` | Deal rooms with state machine | Optionally linked to flow |
| `deal_participants` | Users in a deal room with per-deal roles | Belongs to deal + user |
| `messages` | Chat messages with threading support | Belongs to deal, sent by user |
| `join_requests` | Marketplace flow join requests | Belongs to flow + user |
| `audit_log` | All system actions for compliance | References user, org, resource |
| `active_sessions` | SSE presence tracking | User + optional deal |
| `node_api_configs` | External Canton Node API configs per org | Belongs to org |

### Enums

```sql
user_role: 'admin' | 'editor' | 'viewer'
deal_status: 'draft' | 'open' | 'negotiating' | 'locked' | 'committed'
flow_status: 'draft' | 'published' | 'archived'
audit_action: 'user.register' | 'user.login' | 'user.logout' | 'user.role_change' |
              'flow.create' | 'flow.update' | 'flow.publish' | 'flow.delete' | 'flow.version' |
              'deal.create' | 'deal.status_change' | 'deal.participant_add' | 'deal.participant_remove' |
              'room.create' | 'room.join' | 'room.leave' |
              'message.send' | 'file.upload'
join_request_status: 'pending' | 'approved' | 'rejected'
```

### Deal State Machine

```
DRAFT ──→ OPEN ──→ NEGOTIATING ──→ LOCKED ──→ COMMITTED
  │         │          │              │
  └─────────┴──────────┴──────────────┘
        (Can always go back to DRAFT — Admin only)
```

**Allowed Transitions**:
- `draft → open`: Any Admin/Editor
- `open → negotiating`: Any Admin/Editor (requires ≥2 participants)
- `negotiating → locked`: Admin only (all parties must have signed off — simulated in M2)
- `locked → committed`: Admin only (final state)
- `* → draft`: Admin only (reset to draft)

---

## 5. Authentication & Authorization

### Login Flow

```
1. User enters Canton Party-ID (e.g., "texture::1234")
2. POST /api/auth/login
3. Server validates format: /^[a-z][a-z0-9_-]{1,62}::[a-z0-9_-]{1,62}$/i
4. Server looks up user by party_id in DB
5. If not found → 401 with redirect to /register
6. If found → Issue access_token (15min) + refresh_token (7d)
7. Set as httpOnly cookies → redirect to /studio
```

### Registration Flow

```
1. User visits /register
2. Fills: Organization Name, Display Name, Canton Party-ID, Email (optional)
3. POST /api/auth/register
4. Server validates Party-ID format
5. Server creates organization (if new) + user
6. First user in org → automatically assigned 'admin' role
7. Subsequent users → assigned 'viewer' role (admin can upgrade)
8. Issue JWT tokens → redirect to /studio
```

### Token Refresh

```
1. Access token expires (15min)
2. Client interceptor detects 401
3. POST /api/auth/refresh with refresh_token cookie
4. Server validates refresh token hash in DB
5. If valid → issue new access + refresh tokens, revoke old refresh
6. If token family reuse detected → revoke ALL tokens in family (security breach)
```

### Middleware Route Protection

```typescript
// middleware.ts matcher config
const PUBLIC_PATHS = ['/login', '/register', '/discover', '/demo', '/onboarding',
                      '/media-kit', '/privacy', '/terms', '/cookies',
                      '/api/auth/login', '/api/auth/register', '/api/auth/refresh'];

// All other paths require valid JWT
// Protected API routes also check role via x-user-role header injection
```

---

## 6. API Architecture

### Route Structure

```
/api/
├── auth/
│   ├── login        POST    — Authenticate with Party-ID
│   ├── register     POST    — Create org + user
│   ├── refresh      POST    — Rotate refresh token
│   ├── logout       POST    — Revoke tokens
│   └── me           GET     — Current user profile
│
├── flows/
│   ├── /            GET     — List flows (filtered by org, status)
│   ├── /            POST    — Create flow [Admin, Editor]
│   ├── /templates   GET     — List template flows
│   ├── /[flowId]    GET     — Get flow detail
│   ├── /[flowId]    PUT     — Update flow [Admin, Editor]
│   ├── /[flowId]    DELETE  — Delete flow [Admin]
│   ├── /[flowId]/versions  GET  — List versions
│   ├── /[flowId]/versions  POST — Save new version [Admin, Editor]
│   ├── /[flowId]/publish   POST — Publish flow [Admin, Editor]
│   └── /[flowId]/join      POST — Request to join [Any authenticated]
│
├── deals/
│   ├── /            GET     — List deals (filtered)
│   ├── /            POST    — Create deal [Admin]
│   ├── /[dealId]    GET     — Get deal detail
│   ├── /[dealId]    PUT     — Update status [Admin, Editor]
│   ├── /[dealId]/participants     GET/POST/DELETE — Manage participants
│   ├── /[dealId]/messages         GET  — List messages (cursor pagination)
│   ├── /[dealId]/messages         POST — Send message [Admin, Editor]
│   ├── /[dealId]/messages/stream  GET  — SSE stream
│   └── /[dealId]/upload           POST — Upload file [Admin, Editor]
│
├── admin/
│   ├── /users       GET/PUT — Manage users + roles [Admin only]
│   └── /audit       GET     — Query audit logs [Admin only]
│
└── node-api/
    ├── /            GET/POST — Manage Node API configs [Admin]
    └── /proxy       POST     — Proxy requests to external Node API
```

### API Response Format

```typescript
// Success
{ success: true, data: T }

// Error
{ success: false, error: { code: string, message: string, details?: unknown } }

// Paginated
{ success: true, data: T[], pagination: { cursor: string | null, hasMore: boolean } }
```

### Composable Middleware Pattern

```typescript
// Each API route handler is composed of middleware functions:
export const POST = withMiddleware(
  validateBody(createFlowSchema),  // Zod validation
  requireAuth(),                    // JWT verification
  requireRole('admin', 'editor'),   // RBAC check
  auditLog('flow.create'),          // Audit logging
  async (req, ctx) => {             // Handler
    // ... business logic
  }
);
```

---

## 7. Real-Time Architecture

### SSE Implementation

```typescript
// Server: /api/deals/[dealId]/messages/stream/route.ts
export async function GET(req: Request, { params }) {
  const stream = new ReadableStream({
    start(controller) {
      // Poll DB for new messages every 1s
      // Send via controller.enqueue(`data: ${JSON.stringify(msg)}\n\n`)
      // Heartbeat every 15s: controller.enqueue(`: heartbeat\n\n`)
    },
    cancel() {
      // Clean up: remove from active_sessions
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
```

### Client Hook

```typescript
// use-sse.ts — Generic SSE hook
function useSSE<T>(url: string) {
  // Creates EventSource connection
  // Auto-reconnects on disconnect
  // Falls back to polling after 3 failed reconnects
  // Returns: { data: T[], isConnected: boolean, error: Error | null }
}
```

### Polling Fallback

```typescript
// If SSE connection fails 3 times:
// Switch to polling GET /api/deals/[dealId]/messages?after={lastMessageId}
// Poll interval: 3 seconds
// Exponential backoff on errors
```

---

## 8. File Storage

### Vercel Blob Integration

```typescript
// Upload flow:
// 1. Client: FormData with file → POST /api/deals/[dealId]/upload
// 2. Server: Validate role (Admin/Editor), file size (<10MB), file type
// 3. Server: Upload to Vercel Blob → get CDN URL
// 4. Server: Create message with content_type='file', file_url, file_name, file_size
// 5. SSE broadcasts new file message to room participants

// Supported file types (alpha):
// Documents: .pdf, .doc, .docx, .xls, .xlsx, .csv
// Images: .png, .jpg, .gif, .svg
// Max size: 10MB per file
```

---

## 9. Frontend Architecture

### Route Groups

```
(auth)/     — Public auth pages (login, register)
(app)/      — Authenticated application pages
  studio/   — FlowsStudio (main dashboard)
  deals/    — Deal room list + individual rooms
  admin/    — Admin pages (templates, users, audit)
```

### State Management

- **Server State**: API data fetched via custom hooks (SWR-like pattern)
- **Auth State**: `useCantonAuth()` context — JWT-aware, syncs with cookies
- **UI State**: Local component state (React useState)
- **Real-time State**: SSE-driven message updates via `useSSE()` hook
- **Flow Canvas State**: @xyflow/react internal state + API persistence

### Component Hierarchy

```
RootLayout
├── AuthProvider (JWT-aware context)
├── SiteHeader (hidden when authenticated — shows FlowsStudio nav)
│
├── (auth)/
│   ├── LoginPage → LoginForm
│   └── RegisterPage → RegisterForm
│
├── (app)/
│   ├── AppLayout (session check, sidebar)
│   ├── StudioPage → FlowsStudio
│   │   ├── StudioSidebar (role-aware)
│   │   ├── NetworkGrid (DISCOVER)
│   │   ├── NavigateHub (NAVIGATE) → WorkbenchCanvas
│   │   ├── ActivateEngine (ACTIVATE)
│   │   ├── CollectiveHub (JOIN/marketplace)
│   │   └── RydAITerminal
│   │
│   ├── DealsPage → DealList
│   └── DealRoomPage → DealRoomShell
│       ├── DealStatusBar (state machine)
│       ├── MessageThread → MessageBubble
│       ├── MessageInput (with file upload)
│       ├── ParticipantList
│       └── FileAttachment
│
├── discover/ (standalone experience — unchanged)
├── demo/ (standalone demo — unchanged)
└── onboarding/ (standalone wizard — unchanged)
```

### Role-Based UI Gating

```typescript
// Client-side: RoleGuard component
<RoleGuard roles={['admin', 'editor']}>
  <PublishFlowButton />
</RoleGuard>

// Server-side: Check in API route
const user = await getSession(req);
if (!hasPermission(user.role, 'flow.publish')) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

---

## 10. Upgrade Paths (M3+)

This architecture is specifically designed for easy M3 upgrades. Here's what changes and what doesn't:

### M3: Canton Ledger Integration

| Component | M2 (Current) | M3 (Upgrade) | Frontend Changes |
|-----------|-------------|--------------|------------------|
| **Party-ID Validation** | Regex format check | Cryptographic verification against Canton ledger via Daml API | **NONE** — validation is server-side only |
| **Signatures** | Simulated (status changes logged) | Canton Wallet interaction (real Daml transactions) | **NONE** — signing is behind API |
| **State Machine** | PostgreSQL status enum | Daml contract state on ledger + PostgreSQL mirror | **NONE** — API response shape unchanged |
| **Settlement** | Manual status progression | Atomic settlement via Canton Network | **NONE** — new API endpoints, existing UI unchanged |

### Why Zero Frontend Changes

The M2 architecture is designed with **interface contracts** that M3 can fulfill without touching the frontend:

1. **API shapes are stable**: `GET /api/deals/[id]` returns `{ status: 'locked' }` whether status comes from PostgreSQL or Daml ledger
2. **Auth tokens are extensible**: JWT claims can add `ledgerVerified: true` without breaking existing consumers
3. **State machine transitions are API-gated**: The frontend calls `PUT /api/deals/[id] { status: 'locked' }` — whether the server checks PostgreSQL or submits a Daml transaction is invisible to the client

### Other Upgrade Paths

| Feature | Current (M2) | Future Upgrade |
|---------|-------------|----------------|
| **Real-time** | SSE + polling | WebSocket server (Socket.io) or managed service (Pusher) |
| **Search** | PostgreSQL `LIKE` queries | Full-text search index (pg_trgm or Elasticsearch) |
| **Notifications** | In-app only | Email + push notifications via queue (Resend + web-push) |
| **Multi-chain** | Canton Network only | Abstract chain layer — same UI, different backend connectors |
| **AI (Ryd)** | Static UI panel | LLM integration via streaming API + tool calling |
| **File Storage** | Vercel Blob (10MB) | S3-compatible with presigned URLs (unlimited size) |
| **Audit** | Application-level logging | PostgreSQL triggers + CDC (Change Data Capture) for guaranteed logging |

### Database Migration Strategy

```
1. Always use Drizzle Kit `generate` (creates SQL migration files)
2. Review generated SQL before applying
3. Never use `push` in production (it's destructive)
4. Neon branching: Create a branch for each migration, test, then merge
5. Backwards-compatible changes only (add columns nullable, never remove)
```

---

## 11. Environment Configuration

### Required Environment Variables

```bash
# .env.local (NEVER commit this file)

# === Database ===
DATABASE_URL=postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/flowryd?sslmode=require

# === Authentication ===
JWT_SECRET=<64-char-random-hex>            # Access token signing (HS256)
JWT_REFRESH_SECRET=<64-char-random-hex>    # Refresh token signing (separate key)

# === File Storage ===
BLOB_READ_WRITE_TOKEN=<vercel-blob-token>  # Vercel Blob API token

# === Application ===
NEXT_PUBLIC_APP_URL=http://localhost:3000   # Base URL (changes per environment)

# === External APIs (optional, per-org) ===
NODE_API_BASE_URL=                          # Default Canton Node API endpoint
```

### Environment Template (.env.example)

```bash
# Copy to .env.local and fill in values
DATABASE_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
BLOB_READ_WRITE_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_API_BASE_URL=
```

---

## 12. Security Considerations

### Authentication Security

| Measure | Implementation |
|---------|---------------|
| Token storage | httpOnly + secure + sameSite=lax cookies |
| Token rotation | Refresh tokens are single-use, old tokens immediately revoked |
| Reuse detection | If revoked token is presented, entire token family invalidated |
| CSRF protection | sameSite=lax + token-based API (no cookie-based form submissions) |
| XSS prevention | No tokens in localStorage, httpOnly cookies inaccessible to JS |
| Rate limiting | TODO (M3) — implement per-IP rate limiting on auth endpoints |

### Data Security

| Measure | Implementation |
|---------|---------------|
| Transport | TLS (HTTPS) enforced by Vercel + Neon |
| Secrets | Refresh token hashes stored (SHA-256), never plaintext |
| SQL injection | Parameterized queries via Drizzle ORM (never raw string concatenation) |
| Input validation | Zod schemas on all API inputs |
| Audit trail | All mutations logged with user, timestamp, IP, resource |

### Access Control

| Measure | Implementation |
|---------|---------------|
| Route protection | Next.js middleware validates JWT on every request |
| API authorization | Composable `requireRole()` middleware on each route handler |
| Resource scoping | Users can only access their organization's data |
| Per-deal roles | `deal_participants.role` allows per-deal permission overrides |

---

## Appendix: File Structure

```
flowryd/
├── ARCHITECTURE.md              ← This file
├── SOW_EXECUTION_PLAN.md        ← Task breakdown for implementation
├── drizzle.config.ts            ← Drizzle Kit configuration
├── vitest.config.ts             ← Unit/integration test config
├── playwright.config.ts         ← E2E test config
├── .env.local                   ← Environment variables (gitignored)
├── .env.example                 ← Environment template
├── migrations/                  ← SQL migration files
│
├── src/
│   ├── middleware.ts             ← JWT validation + route protection
│   ├── db/
│   │   ├── schema.ts            ← Drizzle table definitions
│   │   ├── relations.ts         ← Drizzle relation definitions
│   │   ├── index.ts             ← DB client singleton
│   │   └── seed.ts              ← Dev seed data
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── jwt.ts           ← JWT sign/verify (jose)
│   │   │   ├── session.ts       ← Cookie + session management
│   │   │   ├── rbac.ts          ← Role permission checks
│   │   │   └── validate-party-id.ts ← Canton ID format validation
│   │   ├── api/
│   │   │   ├── errors.ts        ← API error classes
│   │   │   ├── response.ts      ← Typed response helpers
│   │   │   └── middleware-chain.ts ← Composable route middleware
│   │   ├── validators/
│   │   │   ├── auth.ts          ← Auth Zod schemas
│   │   │   ├── flows.ts         ← Flow Zod schemas
│   │   │   ├── deals.ts         ← Deal Zod schemas
│   │   │   └── messages.ts      ← Message Zod schemas
│   │   ├── audit.ts             ← Audit logging utility
│   │   ├── auth-context.tsx     ← Client auth context (JWT-aware)
│   │   ├── canton-data.ts       ← Canton participant data
│   │   ├── demo-data.ts         ← Demo flow data
│   │   └── utils.ts             ← Utilities
│   │
│   ├── hooks/
│   │   ├── use-session.ts       ← Client session hook
│   │   ├── use-flows.ts         ← Flow CRUD hooks
│   │   ├── use-deals.ts         ← Deal CRUD hooks
│   │   ├── use-messages.ts      ← Message hooks + SSE
│   │   └── use-sse.ts           ← Generic SSE hook
│   │
│   ├── app/
│   │   ├── (auth)/login/        ← Login page
│   │   ├── (auth)/register/     ← Registration page
│   │   ├── (app)/studio/        ← Main FlowsStudio
│   │   ├── (app)/deals/         ← Deal rooms
│   │   ├── (app)/admin/         ← Admin pages
│   │   └── api/                 ← All API routes
│   │
│   └── components/
│       ├── control-centre/      ← Existing studio components
│       ├── deal-room/           ← New chat room components
│       ├── auth/                ← Login/register/role guard
│       └── admin/               ← Admin management components
│
└── tests/
    ├── unit/                    ← Vitest unit tests
    ├── integration/             ← Vitest integration tests (with DB)
    └── e2e/                     ← Playwright E2E tests
```
