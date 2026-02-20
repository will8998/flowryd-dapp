# Flowryd M3 Roadmap — Canton Ledger Integration

> **Version**: 1.0
> **Date**: February 21, 2026
> **Status**: Planning
> **Author**: Gravity Core LLC

---

## Table of Contents

1. [Current State (M2)](#1-current-state-m2)
2. [Target State (M3)](#2-target-state-m3)
3. [Integration Architecture](#3-integration-architecture)
4. [Participant Onboarding — Soft Launch](#4-participant-onboarding--soft-launch)
5. [Phase-by-Phase Roadmap](#5-phase-by-phase-roadmap)
6. [Responsibilities](#6-responsibilities)
7. [Critical Path](#7-critical-path)

---

## 1. Current State (M2)

| Component | Status | Implementation |
|-----------|--------|---------------|
| Canton Party ID Auth | Format validation only (regex) | `src/lib/auth/validate-party-id.ts` |
| Participant Directory | 80+ companies, static data | `src/lib/canton-data.ts` |
| Canton Service | Mock service, fake data | `src/lib/canton/mock.ts` |
| Deal State Machine | PostgreSQL enum | `deals.status` column |
| $CC Payments | Simulated | `MockCantonService.getWalletBalance()` |
| Node API | Config stored, proxy route exists | `node_api_configs` table |
| Partner Integrations | Zero | Logos only |

### What Already Exists for M3

The M2 architecture was designed with M3 in mind:

- **`CantonService` interface** — 5 methods: `deployContract`, `submitTransaction`, `getWalletBalance`, `getContractStatus`, `getFAMarkers`
- **`MockCantonService`** — Drop-in replacement pattern. Swap mock → live.
- **`node_api_configs` table** — Per-org Canton node endpoint storage with health checks
- **`/api/node-api/proxy`** — API proxy route to forward requests to Canton nodes
- **Typed contracts** — `CantonContractId`, `CantonTransactionHash`, `DeployContractParams`, etc.
- **Zero-frontend-change architecture** — API shapes stay the same regardless of backend

---

## 2. Target State (M3)

```
USER CONNECTS (Party ID — cryptographically verified)
        |
   DISCOVER    → Live verified participants from DB + Canton ledger
        |
   NAVIGATE    → Build flows OR use Jumpstart templates
        |
   ACTIVATE    → Deploy Daml smart contracts via Catalyst CPM
        |              $CC settlement automated
        |              Deal rooms with on-chain state
   SETTLED     → Atomic settlement, revenue share distributed
```

| Component | M3 Target |
|-----------|-----------|
| Party ID | Cryptographic verification against Canton ledger |
| Participants | Self-service onboarding, verified profiles, live directory |
| Canton Service | `LiveCantonService` → real Daml Ledger API |
| Deal State Machine | Daml contract state + PostgreSQL mirror |
| $CC Payments | Real Canton Coin via Fireblocks custody |
| Node API | Live connection to IEU-provisioned Canton node |
| Partner Integrations | Role templates deployed via Catalyst CPM |

---

## 3. Integration Architecture

### Role Templates, Not 80 Custom Integrations

Canton eliminates the N×N integration problem. Instead of building custom API integrations with each partner, Flowryd defines **standard Daml role templates**. Any company that can fill a role installs the template and participates on the ledger.

```
12 Role Templates → Cover 80+ Companies

├── Custody Role          → Fireblocks, Copper, BitGo, Anchorage, Zodia...
├── Liquidity Provider    → Cumberland, Citadel, DRW, Wintermute, GSR...
├── Compliance Check      → TRM Labs, Elliptic, Chainalysis, Lukka...
├── Issuer Role           → Securitize, Fairmint, Ondo, Archax...
├── Settlement Rail       → Circle, Paxos, Brale...
├── Oracle / Pricing      → Chainlink, Pyth, Coin Metrics, Kaiko...
├── Identity Provider     → 5North, 7Trust, Quadrata, Veriff...
├── Registry Role         → DTCC, Euroclear, Nasdaq...
├── Collateral Agent      → HQLAx, Euroclear, BNY...
├── Exchange Role         → Tradeweb, HKEX, Coinbase, Kraken...
├── Wallet Provider       → Safe, Dfns, 1Pilot, Cypherock...
└── Data Provider         → Noves, ALUM Labs, Chainalysis, Chata...
```

### Three Tiers of Partner Integration

**Tier 1 — Daml-Native** (Broadridge DLR, EquiLend 1Source, HQLAx): Already have Daml contracts. Interoperate via Canton protocol. Near-zero integration effort.

**Tier 2 — Canton Validators** (most companies): Run nodes but no custom Daml apps. Install Flowryd role packages via Catalyst CPM. One package per role.

**Tier 3 — Off-Chain Services** (Chainlink, TRM Labs, Veriff): Need adapter contracts — Daml templates that bridge to external APIs. ~5-6 adapter patterns total.

### IEU Catalyst / CPM Role

IntellectEU's Catalyst Package Manager is the deployment engine:
- Packages Daml apps as installable artifacts
- Pushes app stacks to validator nodes
- Manages updates across all connected parties
- "One size fits all" add-on for any app deployer

```
Flowryd defines WHAT goes in each stack
Catalyst CPM handles HOW it gets deployed
```

---

## 4. Participant Onboarding — Soft Launch

### Overview

The `participants` table replaces the static `canton-data.ts` file. Pre-seeded with 80+ existing company profiles as "unclaimed." Real companies can register and claim their profile.

### Onboarding Flow

```
Company connects with Canton Party ID
        |
        v
+-------------------+
| MATCH CHECK       |  System checks: "Do we have a profile for this company?"
|                   |  Matches on name, Party ID, or domain
+--------+----------+
         |
    +----+----+
    |         |
  MATCH     NO MATCH
    |         |
    v         v
+--------+ +----------+
| CLAIM  | | CREATE   |  Fill in company details,
| Profile| | Profile  |  select roles, add description
+--------+ +----------+
    |         |
    +----+----+
         |
         v
+-------------------+
| ADMIN REVIEW      |  Flowryd team verifies claim
|                   |  (manual for now, 5North KYC later)
+--------+----------+
         |
         v
+-------------------+
| LIVE IN DISCOVER  |  Verified badge, visible to all users
+-------------------+
```

### Verification Tiers

| Tier | Badge | Requirements | Visible in Flows |
|------|-------|-------------|-----------------|
| Unclaimed | — | Pre-seeded from canton-data.ts | Yes (as reference data) |
| Pending | clock | Claimed, awaiting review | No |
| Approved | checkmark | Admin-reviewed, identity confirmed | Yes |
| Verified | shield | 5North KYC + 7Trust domain (M3) | Yes (featured) |
| Rejected | — | Claim denied | No |

### Database: `participants` Table

See `src/db/schema.ts` — `participants` table with:
- Legacy ID mapping (backwards compat with `canton-data.ts`)
- Claim/verification workflow fields
- Role and capability data (matches existing Participant type)
- Organization link (when claimed)

### Seed Strategy

All 80+ entries from `canton-data.ts` are loaded into the `participants` table with `verificationStatus: 'unclaimed'`. When a real company comes in:

1. They register as a Flowryd user (existing auth flow)
2. They go to `/onboard` and see: "We found a profile matching your company. Claim it?"
3. They verify details, update description/logo, claim it
4. Admin reviews and approves
5. Profile goes from `unclaimed` → `pending` → `approved`

Existing UI components (discover grid, flow builder, participant tray) read from the DB instead of static imports. The `Participant` TypeScript interface stays the same — backwards compatible.

---

## 5. Phase-by-Phase Roadmap

### Phase 0 — Business Prerequisites
**Timeline: Now (parallel track)**

| Step | Detail | Owner |
|------|--------|-------|
| Lock IEU/Catalyst partnership | They provide Flowryd node + write app stacks whitepaper section | Liz + Chris |
| Engage 5North | Canton-native KYC (5N ID). Core to verified party checks. | Liz |
| Engage 7Trust | PartyID-to-DNS domain verification | Liz |
| Validate canton-data.ts | Confirm which companies are live on Canton mainnet | Team |
| Digital Asset consulting | Daml smart contract design review | Via IEU or direct |
| Whitepaper completion | Logos + app stacks architecture (IEU writes technical) | Liz + IEU |

### Phase 1 — Canton Node Setup
**Timeline: Week 1-2 | Owner: IEU + Dev Team**

| Step | Detail |
|------|--------|
| IEU provisions validator node | Via Catalyst Blockchain Manager (Kubernetes) |
| Connect to Global Synchronizer | Node joins Canton Network, gets Participant ID |
| Configure in Flowryd admin | Admin → Node API → add endpoint URL (existing UI) |
| Test connectivity | Hit Ledger API from `/api/node-api/proxy`. Green health check. |
| Set up testnet node | Separate node for dev/testing. Never develop against mainnet. |

### Phase 2 — Real Party ID Verification
**Timeline: Week 2-4 | Owner: Dev Team + 5North + 7Trust**

| Step | Detail |
|------|--------|
| Query Canton topology | Validator API `DumpParticipantIdentities` — check if Party ID exists |
| Integrate ANS | `LookupAnsEntryByName` / `LookupAnsEntryByParty` — name resolution |
| Update validate-party-id.ts | Add async `verifyOnLedger()` — regex pre-check + ledger authority |
| Integrate 7Trust | PartyID ↔ DNS domain credentials |
| Integrate 5North 5N ID | KYC verification. Gate deal room access by verification level. |
| Live participant queries | Replace static canton-data.ts with DB + optional ledger queries |
| Verification badges | Show verified vs. listed-only in discover UI |

### Phase 2.5 — Participant Self-Onboarding (Soft Launch)
**Timeline: Week 2-3 | Owner: Dev Team**

This runs in M2 on PostgreSQL. No Canton dependency.

| Step | Detail |
|------|--------|
| Add `participants` DB table | Schema with claim/verification fields |
| Seed from canton-data.ts | 80+ entries as 'unclaimed' profiles |
| Build onboarding wizard | `/onboard` — claim existing or create new profile |
| Build claim API | `POST /api/participants/claim` — match + claim flow |
| Build admin review tab | Admin panel → Participants → review/approve claims |
| Update discover to use DB | Read from `participants` table instead of static import |
| Team starts onboarding | Manually invite early partners to claim profiles |

### Phase 3 — Daml Smart Contract Design
**Timeline: Week 3-6 | Owner: IEU + Digital Asset**

| Step | Detail |
|------|--------|
| Map data model → Daml | Flow → workflow contract, Deal → state machine contract, Payment → $CC transfer |
| Design Daml choices | `OpenDeal`, `StartNegotiation`, `LockDeal`, `CommitDeal`, `ResetToDraft` |
| Design payment templates | Orchestration fees, revenue share, settlement |
| Design FA Marker contracts | On-chain Featured App rewards |
| Write Daml code | IEU writes (they're writing the app stacks) |
| Test on Canton testnet | Deploy, exercise choices, verify state transitions |

### Phase 4 — LiveCantonService Implementation
**Timeline: Week 5-8 | Owner: Dev Team**

| Step | Detail |
|------|--------|
| Create `live.ts` | `LiveCantonService implements CantonService` — real Daml Ledger API |
| Implement `deployContract()` | `DeployContractParams` → Daml `create` command |
| Implement `submitTransaction()` | `SubmitTransactionParams` → Daml `exercise` command |
| Implement `getWalletBalance()` | Real $CC balance via Canton Wallet/Scan API |
| Implement `getContractStatus()` | Query active contract state from ledger |
| Implement `getFAMarkers()` | Query FA Marker contracts |
| Update factory | `CANTON_MODE=mock\|live` environment switch in `index.ts` |
| Wire deal state machine | Deal status changes → Daml choice exercise. PostgreSQL = mirror. |
| Ledger event subscription | Canton transaction stream → auto-update PostgreSQL mirror |
| Dual-write period | Write to both. Read from PostgreSQL (fast). Reconcile. |

### Phase 5 — $CC Payment Rails
**Timeline: Week 7-10 | Owner: Dev Team + Fireblocks**

| Step | Detail |
|------|--------|
| Fireblocks $CC custody | Configure vault for Canton Coin |
| Payment flow in Daml | Deal committed → auto $CC transfer. Orchestration fee → Flowryd. Revenue share → Featured Apps. |
| Wire `getWalletBalance()` | Real balance via Fireblocks API |
| Settlement automation | Locked + all signed → atomic settlement. No manual click. |
| Payment history UI | $CC transaction history in deal rooms |

### Phase 6 — App Stack Packaging via Catalyst CPM
**Timeline: Week 8-12 | Owner: IEU + Dev Team**

| Step | Detail |
|------|--------|
| Package Daml apps | Each workflow's templates → CPM artifact (DAR + config) |
| Define stack bundles | `defi` = CantonSwap + Chainlink + Circle. `custody` = Fireblocks + Copper + BitGo. etc. |
| Wire Jumpstarts to CPM | Jumpstart selection → CPM API install → packages deployed to validator |
| Deploy button E2E | Click deploy → CPM installs → Daml contracts created → deal room opens → parties notified |
| Update management | CPM pushes updates to all connected validators |

### Phase 7 — Live Partner API Integrations
**Timeline: Week 10-14 | Owner: Dev Team**

| Partner | Integration |
|---------|------------|
| Chainlink / Pyth | Oracle price feeds in Daml contracts |
| TRM Labs / Elliptic | Pre-trade sanctions/AML checks |
| Chainalysis | Transaction monitoring in deal rooms |
| Fireblocks | Custody settlement confirmations |
| Noves | Human-readable on-chain data |
| ALUM Labs | Validator health monitoring in admin |

### Phase 8 — Testing, Migration & Launch
**Timeline: Week 12-16 | Owner: Everyone**

| Step | Detail |
|------|--------|
| Canton testnet E2E | Full journey: connect → discover → jumpstart → deploy → negotiate → settle |
| Load testing | Concurrent deals, many parties, high throughput |
| Security audit | Daml contracts (IEU/DA), API security, key management (Fireblocks) |
| Dual-write verification | 2+ weeks parallel run. PostgreSQL + Daml never drift. |
| Cutover | Daml = source of truth. PostgreSQL = read cache. `CANTON_MODE=live` |
| Canton mainnet deploy | Production contracts + production node |
| Staged rollout | Internal → selected partners → public |

---

## 6. Responsibilities

| Party | Owns |
|-------|------|
| **Flowryd Dev Team** | Phases 2, 2.5, 4, 5, 7, 8 — all application code |
| **IEU / Catalyst** | Phases 1, 3, 6 — node infra, Daml contracts, CPM packaging |
| **5North** | Phase 2 — KYC identity verification |
| **7Trust** | Phase 2 — PartyID domain credentials |
| **Fireblocks** | Phase 5 — $CC custody and settlement |
| **Digital Asset** | Phase 3 — Daml consulting / review |
| **Partner Companies** | Phase 7 — API access + documentation |
| **Liz** | Phase 0 — partnerships, logos, whitepaper |
| **Chris (IEU)** | Phases 1, 3, 6 — node, Daml, CPM |

---

## 7. Critical Path

```
Phase 0: Business (NOW)
    |
Phase 1: Node Setup (W1-2) ─────────────────────────────┐
    |                                                     |
Phase 2: Party Verification (W2-4)                       |
    |                                                     |
Phase 2.5: Participant Onboarding [SOFT LAUNCH] (W2-3)   |
    |                                                     |
Phase 3: Daml Contracts (W3-6) ◄─── LONGEST POLE ────────┘
    |                                  (IEU delivers)
Phase 4: LiveCantonService (W5-8)
    |
Phase 5: $CC Rails (W7-10)
    |
Phase 6: CPM Packaging (W8-12)
    |
Phase 7: Partner APIs (W10-14)
    |
Phase 8: Testing + Launch (W12-16)
```

**Phase 3 (Daml smart contracts) is the longest pole.** Everything else builds on working contracts. That's IEU's deliverable.

**Phase 2.5 (Participant Onboarding) can ship immediately** in M2 — no Canton dependency. This is the soft launch.

---

## Appendix: Key Technical References

| File | Purpose |
|------|---------|
| `src/lib/canton/interface.ts` | `CantonService` interface (5 methods) |
| `src/lib/canton/mock.ts` | `MockCantonService` (current) |
| `src/lib/canton/live.ts` | `LiveCantonService` (M3 — to build) |
| `src/lib/canton/index.ts` | Factory with `CANTON_MODE` switch |
| `src/lib/canton/types.ts` | Contract, transaction, wallet types |
| `src/lib/canton-data.ts` | Static participant data (80+ entries) |
| `src/db/schema.ts` | `participants` table (DB-backed directory) |
| `src/lib/auth/validate-party-id.ts` | Party ID validation (regex → ledger) |
| `drizzle.config.ts` | Database migration config |
