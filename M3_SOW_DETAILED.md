# Flowryd M3 — Full Scope of Work

> **Version**: 2.0 (AI-Adjusted)  
> **Date**: February 28, 2026  
> **Status**: Ready for Team Review  
> **For**: Will (Engineering) + Liz (Partnerships & Business)

---

## How to Read This Document

This SOW is split into two lanes:

- **WILL'S LANE** — Code, architecture, integration. AI-accelerated. Will builds with AI tooling, moves fast.  
- **LIZ'S LANE** — Vendor agreements, partnerships, licensing. Human-to-human. Cannot be AI'd.

Every work item is tagged with an owner. If it says **BLOCKED BY LIZ**, Will literally cannot start until Liz delivers the vendor access/agreement.

---

## Executive Summary

| | |
|---|---|
| **What we're doing** | Making every "Submit" button in Flowryd trigger a real cryptographic event on Canton Network, with real $CC settlement via Fireblocks |
| **What doesn't change** | The entire frontend. Zero UI changes. Backend swap only. |
| **Calendar timeline** | **12–16 weeks** (3–4 months) |
| **Total Year 1 cost** | **$350K–$620K** |
| **Will's engineering cost** | **$85K–$105K** (AI-accelerated, ~12–15 eng-weeks) |
| **Vendor/partner costs** | **$265K–$515K** (licensing, hosting, consulting, custody) |
| **Biggest risk** | IEU/Daml contract delivery — if they're late, everything shifts |
| **Quick win** | Partner onboarding portal ships in **1 week**, no vendor dependency |

---

## The Two Lanes — Overview

```
WILL'S LANE (Engineering)              LIZ'S LANE (Partnerships)
─────────────────────────              ────────────────────────
Week 1:  Partner onboarding portal     IEU partnership (CRITICAL)
Week 2:  Node config + proxy wiring    Fireblocks enterprise agreement
Week 3:  Party-ID ledger verification  5North engagement (KYC)
Week 4:  LiveCantonService scaffold    7Trust engagement (DNS verify)
Week 5:  ↓ BLOCKED — waiting on       Digital Asset consulting intro
Week 6:  ↓ Daml contracts from IEU    Whitepaper V1 with IEU
Week 7:  LiveCantonService goes live   Partner outreach (first 10)
Week 8:  Ledger sync + dual-write
Week 9:  $CC / Fireblocks wiring
Week 10: CPM integration
Week 11: Partner adapter patterns
Week 12: E2E testing on testnet
Week 13: Dual-write soak period
Week 14: Security audit coordination   Coordinate DA/IEU security review
Week 15: Staged rollout (internal)
Week 16: Staged rollout (partners)     GO LIVE
```

---

## LIZ'S LANE — What Vendors We Need

This is everything Liz needs to secure. Ordered by urgency.

### PRIORITY 1 — Blocks Everything (Need ASAP)

#### V1: IntellectEU (IEU) / Catalyst Partnership
**Why critical**: They provide our Canton validator node, write the Daml smart contracts, and package everything via CPM. Without IEU, there is no M3.

| What we need from them | Why | When |
|------------------------|-----|------|
| Signed partnership agreement | Legal foundation | **Week 1** |
| Flowryd validator node (testnet) | Already running at `canton.test.catalyst.flowryd.xyz` — confirm it's ours | **Week 1** |
| Flowryd validator node (mainnet) | Production environment | **Week 12** |
| Daml smart contract development | 12 role templates + 5 adapter patterns + core workflow contracts. **This is the critical path.** | **Weeks 3–8** |
| Catalyst CBM + CPM license | Infrastructure management + package deployment | **Week 1** |
| Whitepaper technical section | IEU writes the app stack architecture section | **Week 4–6** |
| Ongoing node hosting (Kubernetes) | 2 nodes: test + production | **Ongoing** |

**Estimated cost:**

| Line item | Cost |
|-----------|------|
| Catalyst license (CBM + CPM) | $50K–$100K/year |
| Node hosting (2 nodes) | $6K–$10K/month ($72K–$120K/year) |
| Daml contract development + consulting | $80K–$150K one-time |
| **IEU total Year 1** | **$200K–$370K** |

> **NOTE**: The Daml contract estimate assumes IEU uses AI-assisted development too. The old estimate of $150K–$250K for "Digital Asset consulting" can be compressed if IEU's engineers use AI tooling and Will provides detailed specifications for the Daml data model mapping. Will has already documented the exact PostgreSQL → Daml mapping needed (see Phase 3 below). This is not blue-sky architecture — it's a well-defined translation task.

**Negotiation leverage**: Flowryd is a showcase customer for Canton Network. IEU gets a reference customer deploying their Catalyst platform in production. This should drive pricing down.

---

#### V2: Fireblocks — $CC Custody & Settlement
**Why critical**: Real $CC (Canton Coin) must flow through institutional-grade custody. Fireblocks is the standard.

| What we need from them | Why | When |
|------------------------|-----|------|
| Enterprise API access | Vault management, transfer API, policy engine | **Week 6** (sandbox immediately, prod by Week 12) |
| Canton External Signing support | Fireblocks signs Daml transactions via their MPC keys | **Week 8** |
| Sandbox environment | Development against test $CC | **Week 2** (start early) |
| Solution engineering support | UTXO ($CC Splice Amulet) integration is non-trivial | **Week 8–10** |

**Key technical context for Liz**: $CC is NOT like a normal token (ERC-20). It uses a UTXO model (like Bitcoin, not like Ethereum). Fireblocks doesn't have a native Canton driver — they integrate via "External Signing" where Fireblocks holds the private keys and signs Canton transactions remotely. This means:
- We need Fireblocks' **solution engineering team** involved, not just API access
- The topology onboarding (registering Fireblocks keys on Canton) is a one-time setup that requires coordination between IEU, Fireblocks, and Will

**Estimated cost:**

| Line item | Cost |
|-----------|------|
| Fireblocks enterprise license | $50K–$100K/year |
| **Fireblocks total Year 1** | **$50K–$100K** |

**Negotiation leverage**: Flowryd is building the $CC settlement layer for institutional deals. Fireblocks gets to be THE custody provider for Canton Network flows. Case study opportunity.

---

### PRIORITY 2 — Needed by Week 3–4

#### V3: 5North — KYC / Identity Verification
**Why**: Canton-native KYC. Verifies that a Canton Party ID belongs to a real, KYC'd company. Gates deal room access.

| What we need | When | Estimated cost |
|-------------|------|---------------|
| 5N ID API access + sandbox | **Week 3** | TBD — likely partnership-based, may be included in Canton Network membership |

**Ask**: "We need API access to 5N ID to verify participant identities on Canton Network. We have 80+ participants in our directory and need to gate deal rooms by KYC status."

---

#### V4: 7Trust (7Ridge) — DNS Domain Verification
**Why**: Proves that a Canton Party ID belongs to a specific domain (e.g., "This Party ID = fireblocks.com"). Institutional trust layer.

| What we need | When | Estimated cost |
|-------------|------|---------------|
| API access for PartyID ↔ DNS verification | **Week 3** | TBD — likely partnership-based |

**Ask**: "We need to verify that Canton Party IDs map to legitimate company domains. 7Trust's DNS verification is the standard for this on Canton Network."

---

### PRIORITY 3 — Needed by Week 10–12

#### V5: Partner API Access (Adapter Tier)
These are the off-chain services that Daml contracts need to talk to. Not urgent — Will builds the adapter *pattern* first, then wires in the specific vendor APIs.

| Vendor | What for | Estimated cost | When needed |
|--------|----------|---------------|-------------|
| **Chainlink / Pyth** | Real-time price feeds for collateral valuation | $1K–3K/month | Week 12 |
| **TRM Labs / Elliptic** | Pre-trade AML/sanctions screening | $2K–5K/month | Week 12 |
| **Chainalysis** | Ongoing transaction monitoring | $2K–5K/month | Week 14 |
| **Noves** | Human-readable deal history from raw ledger data | $500–2K/month | Week 14 |
| **ALUM Labs** | Validator network health telemetry | $500–1K/month | Week 14 |
| **Subtotal** | | **$6K–$16K/month ($72K–$192K/year)** | |

**NOTE**: Not all are needed at launch. Chainlink + TRM are most important for the "real deal" story. Others can be phased in post-launch.

**Minimum for launch**: Chainlink/Pyth + TRM Labs = ~$3K–$8K/month

---

### PRIORITY 4 — Security & Launch

#### V6: Security Audit
| What | Who | When | Estimated cost |
|------|-----|------|---------------|
| Daml contract security review | IEU/Digital Asset (may be included in V1 contract) | Week 14 | $15K–$30K |
| API penetration test | Third-party security firm | Week 14 | $10K–$20K |
| **Subtotal** | | | **$25K–$50K** |

---

### Vendor Cost Summary for Liz

| Vendor | One-Time | Year 1 Recurring | Total Year 1 | Priority |
|--------|----------|------------------|-------------|----------|
| **IEU / Catalyst** | $80K–$150K (Daml dev) | $122K–$220K (license + hosting) | **$200K–$370K** | P1 — ASAP |
| **Fireblocks** | — | $50K–$100K | **$50K–$100K** | P1 — Week 2 |
| **5North** | — | TBD (partnership) | **TBD** | P2 — Week 3 |
| **7Trust** | — | TBD (partnership) | **TBD** | P2 — Week 3 |
| **Partner APIs** | — | $36K–$96K (min launch set) | **$36K–$96K** | P3 — Week 12 |
| **Security audits** | $25K–$50K | — | **$25K–$50K** | P4 — Week 14 |
| **TOTAL VENDOR** | **$105K–$200K** | **$208K–$416K** | **$310K–$615K** | |

---

## WILL'S LANE — Engineering Work Plan

All timelines assume AI-assisted development. Will works with AI tooling — what used to be 3 weeks of coding becomes 1 week.

### W1: Participant Onboarding Portal (SHIPS WEEK 1)
**Zero vendor dependency. Can start right now.**

| Task | What | Time |
|------|------|------|
| Seed participants DB | Load 80+ companies from `canton-data.ts` into `participants` table. Seed script already exists. | 2 hours |
| Onboarding wizard | `/onboard` page — company connects, system matches their profile, they claim it. Multi-step UI. | 1–2 days |
| Claim API | `POST /api/participants/[id]/claim` — route structure already exists, wire the logic. | 0.5 day |
| Admin review | Admin panel → Participants tab → approve/reject claims. Route exists. | 0.5 day |
| Discover reads from DB | Swap static import to database query. Keep backward compat with existing `Participant` type. | 0.5 day |
| **Total** | | **~3 days** |

**Why this matters**: Liz can start inviting partners to claim their profiles *this week*. Builds pipeline while everything else is being built. No Canton, no Fireblocks, no IEU needed.

---

### W2: Canton Node Configuration (BLOCKED BY: Liz → IEU)
**Requires**: IEU confirms test node is ours, provides Participant ID

| Task | What | Time |
|------|------|------|
| Wire admin UI to CBM | Update `node_api_configs` with live CBM endpoint. Test health check. | 0.5 day |
| Test Ledger API proxy | Verify `/api/node-api/proxy` can hit `/participants/{name}/jsonapi/v2/query` | 0.5 day |
| JWT auth for Ledger API | Generate Canton JWTs with `actAs`/`readAs` party claims | 1 day |
| **Total** | | **~2 days** |

---

### W3–4: Identity Verification (BLOCKED BY: Liz → 5North, 7Trust)
**Requires**: 5North and 7Trust API access

| Task | What | Time |
|------|------|------|
| Canton topology queries | `DumpParticipantIdentities` — verify Party IDs exist on-ledger | 1 day |
| ANS integration | Resolve human-readable names to Party IDs via Splice.Ans | 1 day |
| Update `validate-party-id.ts` | Add async `verifyOnLedger()` — regex check + ledger authority | 0.5 day |
| 5North KYC integration | Wire 5N ID API for participant KYC status | 1–2 days |
| 7Trust DNS verification | PartyID ↔ domain proof | 1 day |
| Verification badges UI | Shield icon (KYC verified), checkmark (DNS verified) in Discover | 0.5 day |
| **Total** | | **~5–6 days** |

---

### W4–5: LiveCantonService Scaffold
**Requires**: Test node accessible (from W2). Does NOT require Daml contracts yet — builds against mock contracts initially.

| Task | What | Time |
|------|------|------|
| Install `@daml/ledger` SDK | Add TypeScript Daml client packages | 1 hour |
| Create `live.ts` | `LiveCantonService implements CantonService` — all 5 methods | 1–2 days |
| Ledger client wrapper | Auth-aware `@daml/ledger` wrapper with token refresh | 0.5 day |
| Environment factory | `CANTON_MODE=mock\|live` toggle in `index.ts` | 1 hour |
| **Total** | | **~3 days** |

---

### W5–7: WAITING ON IEU — Daml Contracts
**Will is BLOCKED here on the core contract work. But not idle.**

While waiting for IEU to deliver Daml contracts, Will works on:
- Phase 2.5 polish (onboarding wizard improvements based on first partner feedback)
- Intelligence Dashboard enhancements
- Pre-building the Fireblocks client library (against sandbox)
- Pre-building adapter pattern scaffolds (oracle, compliance gate)
- Writing integration tests against mock contracts

**What IEU needs to deliver (Will provides the spec):**

Will gives IEU this exact data model mapping:

| PostgreSQL Table | → Daml Template | Choices Needed |
|-----------------|-----------------|----------------|
| `deals` + `deal_status` | `DealStateMachine` | `OpenDeal`, `StartNegotiation`, `LockDeal`, `CommitDeal`, `ResetToDraft` |
| `deal_participants` | `DealParticipantAgreement` | `SignOff`, `Withdraw` |
| `flows` | `FlowWorkflow` | `Publish`, `Archive`, `AddParticipant` |
| `payment_methods` + `invoices` | `CCTransfer` + `OrchestratorFee` | `InitiateTransfer`, `ConfirmSettlement`, `DistributeFees` |
| FA marker concept | `FAMarkerReward` | `AccumulateMarkers`, `DistributeRewards` |
| 12 role categories | 12 Role Templates | `InstallRole`, `ActivateRole`, `DeactivateRole` |

This is not ambiguous. Will specifies exactly what fields, what choices, what state transitions. IEU translates to Daml syntax and handles Canton-specific patterns (privacy, authorization, sub-transactions).

---

### W7–8: LiveCantonService Goes Live (BLOCKED BY: IEU delivers contracts)

| Task | What | Time |
|------|------|------|
| Wire real contracts | Point `deployContract()` at real DAR templates | 1 day |
| Wire state machine | Deal status changes → Daml `exercise` commands | 1 day |
| Ledger event subscription | Canton transaction stream → auto-update PostgreSQL mirror | 2 days |
| Dual-write mode | Write to Daml + PostgreSQL. Read from PostgreSQL. Reconciliation job. | 1 day |
| **Total** | | **~5 days** |

---

### W9–10: $CC Settlement (BLOCKED BY: Liz → Fireblocks sandbox)

| Task | What | Time |
|------|------|------|
| Fireblocks client library | Vault management, transfer API, policy engine wrapper | 1 day |
| Topology onboarding | Register Fireblocks keys on Canton (with IEU help) | 2 days |
| Splice External Party setup | `createExternalPartySetupProposal` on `AmuletRules` | 1 day |
| Settlement bridge | Listen for Daml signature requests → forward to Fireblocks | 2 days |
| Atomic settlement | Deal committed → auto $CC transfer with fee split | 1 day |
| Payment history UI | $CC transaction history in deal rooms | 0.5 day |
| **Total** | | **~7–8 days** |

---

### W10–11: CPM Packaging + Partner Adapters

| Task | What | Time |
|------|------|------|
| CPM integration API | Check package status, trigger installs via Catalyst CPM | 2 days |
| Wire Jumpstarts to CPM | Template selection → CPM deploy → contracts created | 1 day |
| Oracle adapter (Chainlink/Pyth) | Price feed → Daml oracle contract | 1 day |
| Compliance gate (TRM/Elliptic) | AML check → Daml compliance gate | 1 day |
| Other adapters (Noves, ALUM, Chainalysis) | Monitoring, readable data, health | 1–2 days |
| **Total** | | **~6–7 days** |

---

### W12–16: Testing, Migration & Launch

| Task | What | Time |
|------|------|------|
| Canton testnet E2E | Full flow: connect → discover → deploy → negotiate → settle $CC | 2 days |
| Load testing | 10+ concurrent deals, 50+ parties | 1 day |
| Coordinate security audits | Work with IEU on Daml audit, third-party on API audit | Liz schedules, Will supports |
| Dual-write soak test | 2 weeks running both. Monitor for drift. | 2 weeks (mostly monitoring) |
| Cutover | `CANTON_MODE=live`. Daml = source of truth. PostgreSQL = cache. | 1 day |
| Staged rollout | Internal → 5 partners → all partners → public | 3 weeks |
| **Total** | | **~3 weeks active work + 2–3 weeks soak/rollout** |

---

## Will's Engineering Cost Summary

| Phase | Work | Calendar | Active Eng Days | Cost @ ~$1.2K/day |
|-------|------|----------|----------------|-------------------|
| W1: Onboarding portal | Ship immediately | Week 1 | 3 days | $3.6K |
| W2: Node config | Wire to CBM | Week 2 | 2 days | $2.4K |
| W3–4: Identity | 5North, 7Trust, ANS | Weeks 3–4 | 6 days | $7.2K |
| W4–5: LiveCanton scaffold | Build against mock | Weeks 4–5 | 3 days | $3.6K |
| W5–7: Pre-build (while waiting on IEU) | Fireblocks client, adapters, tests | Weeks 5–7 | 8 days | $9.6K |
| W7–8: LiveCanton live | Wire real contracts | Weeks 7–8 | 5 days | $6K |
| W9–10: $CC settlement | Fireblocks + Splice | Weeks 9–10 | 8 days | $9.6K |
| W10–11: CPM + adapters | Package deploy, partner APIs | Weeks 10–11 | 7 days | $8.4K |
| W12–16: Test + launch | E2E, soak test, rollout | Weeks 12–16 | 15 days | $18K |
| **TOTAL** | | **16 weeks calendar** | **57 active days (~12 eng-weeks)** | **$68.4K** |

*At $1.2K/day fully loaded rate. Adjust to actual. At $1.5K/day = $85.5K. At $2K/day = $114K.*

---

## Total Program Cost — What Liz Needs to Budget

### Minimum Viable M3 (Get it live, essential vendors only)

| Category | Cost |
|----------|------|
| Will's engineering | $85K–$115K |
| IEU (Catalyst license + hosting + Daml contracts) | $200K–$280K |
| Fireblocks enterprise | $50K–$75K |
| Essential partner APIs (Chainlink + TRM only) | $36K–$60K/year |
| Security audit | $25K–$35K |
| **Minimum Year 1 total** | **$395K–$565K** |

### Full M3 (All vendors, all partner APIs)

| Category | Cost |
|----------|------|
| Will's engineering | $85K–$115K |
| IEU (full engagement) | $250K–$370K |
| Fireblocks enterprise | $50K–$100K |
| All partner APIs | $72K–$192K/year |
| Security audits | $25K–$50K |
| 5North + 7Trust | TBD (partnership) |
| **Full Year 1 total** | **$480K–$825K** |

### Year 2+ Recurring (No one-time costs)

| Category | Annual |
|----------|--------|
| IEU hosting + license | $122K–$220K |
| Fireblocks | $50K–$100K |
| Partner APIs | $36K–$192K |
| Will's maintenance | ~$30K–$50K |
| **Year 2+ total** | **$240K–$560K** |

---

## Decision Matrix for Liz

Liz's priority call list, in order:

| # | Call | Ask | Impact if Delayed | Target Date |
|---|------|-----|-------------------|-------------|
| 1 | **Chris (IEU)** | "Confirm our test node, sign partnership, commit to Daml contract timeline" | **Everything stops** | This week |
| 2 | **Fireblocks** | "Start enterprise agreement, get sandbox access immediately" | $CC settlement delayed | This week |
| 3 | **5North** | "API access for Canton-native KYC" | Verification badges delayed, not a blocker | Week 2 |
| 4 | **7Trust** | "API access for Party-ID DNS verification" | Same as above | Week 2 |
| 5 | **TRM Labs** | "Compliance screening API for pre-trade checks" | Compliance adapter delayed | Week 8 |
| 6 | **Chainlink/Pyth** | "Price feed API for collateral valuation" | Oracle adapter delayed | Week 8 |
| 7 | **Security firm** | "Schedule Daml + API security audit for Week 14" | Launch delayed | Week 10 |

---

## Gantt — Both Lanes

```
WEEK:  1    2    3    4    5    6    7    8    9   10   11   12   13   14   15   16
       ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ──── ────

WILL'S LANE:
Onboarding Portal    ████
Node Config               ████
Identity/Verify                 ████████████
LiveCanton Scaffold                  ████████
Pre-build (waiting)                       ████████████████
LiveCanton Live                                     ████████████
$CC / Fireblocks                                              ████████████████
CPM + Adapters                                                     ████████████████
Testing                                                                      ████████████
Soak Test                                                                         ████████████
Staged Rollout                                                                              ████████

LIZ'S LANE:
IEU Partnership      ████████
Fireblocks Agreement      ████████████
5North Engagement              ████████
7Trust Engagement              ████████
IEU Daml Contracts                   ████████████████████████████████████
Whitepaper V1                             ████████████
Partner Outreach          ████████████████████████████████████████████████████████████████
TRM/Chainlink APIs                                                ████████
Security Audit                                                                   ████████
```

---

## What Will Starts Monday

1. **Build the participant onboarding portal.** No blockers. Ships this week. Liz can start inviting partners immediately.

2. **Write the exact Daml contract specification** that Will hands to IEU — every template, every choice, every field. So when Liz gets IEU signed, Will has the spec ready to hand over and IEU can start immediately.

3. **Pre-build the Fireblocks client library** against their public API docs — so when Liz gets sandbox access, Will just swaps in real credentials.

---

## Appendix: What's Already Built (M2)

For Liz's context when talking to vendors:

| Already done | Evidence |
|-------------|---------|
| 57 API routes (auth, flows, deals, admin, billing) | Production code |
| 20+ database tables with full schema | Drizzle ORM, Neon PostgreSQL |
| 80+ Canton participant profiles | Static data + DB table ready |
| Canton service interface (5 methods) | Interface + mock + factory pattern |
| Deal state machine (5 states + transitions) | Working in PostgreSQL |
| Real-time messaging (SSE + polling) | Working in production |
| JWT auth with Canton Party-IDs | Working in production |
| Role-based access control | 3 roles, enforced everywhere |
| File upload/storage | Vercel Blob integration |
| Audit logging | All actions logged |
| Test node running | `canton.test.catalyst.flowryd.xyz` — 126 API endpoints accessible |

**We are not starting from zero.** M2 was explicitly designed for zero-frontend-change M3 upgrade. The mock→live swap is an engineering task, not a rewrite.
