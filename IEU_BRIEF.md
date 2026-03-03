# Flowryd × IntellectEU — Technical Brief & Scope

> **Date**: February 28, 2026  
> **From**: Flowryd Engineering (Will)  
> **To**: IntellectEU / Catalyst Team (Chris)  
> **Purpose**: Everything IEU needs to understand Flowryd, what we need from you, and what we'll deliver on our side.

---

## Part 1: What Flowryd Is

### The One-Liner

Flowryd is an **institutional SaaS platform for Canton Network** — think Salesforce for multi-party financial workflows, where the "CRM" is Canton, the "contacts" are verified Canton participants, and the "deals" are Daml smart contracts with real $CC settlement.

### The Three-Stage Pipeline

```
DISCOVER  →  NAVIGATE  →  ACTIVATE
 (Find)      (Build)      (Execute)
```

**DISCOVER**: A verified directory of 80+ Canton Network participants. Companies browse, filter by role (Custody, Liquidity, Compliance, etc.), and find counterparties for their workflows.

**NAVIGATE**: A visual flow builder (drag-and-drop canvas, like Figma for workflows). Users pick participants, assign roles, define stages, and build multi-party workflows. Can start from scratch or use pre-built "Jumpstart" templates.

**ACTIVATE**: Deploy the workflow as live Daml contracts. Open deal rooms (real-time chat + state machine). Negotiate terms. Lock the deal. Commit. $CC settles atomically.

### What Users See

```
┌─────────────────────────────────────────────────────────────┐
│  CONTROL CENTRE (FlowsStudio)                               │
│  ┌────────────┐                                              │
│  │ Sidebar    │  ┌──────────────────────────────────────┐   │
│  │            │  │                                      │   │
│  │ DISCOVER   │  │  (Active view — switches per tier)   │   │
│  │ NAVIGATE   │  │                                      │   │
│  │ ACTIVATE   │  │  Discover → Network grid of 80+      │   │
│  │ JOIN       │  │  Navigate → Canvas flow builder      │   │
│  │ INTEL      │  │  Activate → Deal deployment          │   │
│  │ ADMIN      │  │  Join → Marketplace of public flows  │   │
│  │            │  │                                      │   │
│  └────────────┘  └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Deal Room — The Core Product

When a workflow gets deployed, a **Deal Room** opens. This is where the real business happens:

```
DEAL ROOM
┌─────────────────────────────────────────────────┐
│  Deal: "Cross-Border Repo — Q2 Facility"        │
│  Status: [NEGOTIATING] ←→ state machine bar     │
│                                                  │
│  ┌──────────────────────┐  ┌──────────────────┐ │
│  │  MESSAGE THREAD      │  │  PARTICIPANTS    │ │
│  │                      │  │  ┌──────────┐    │ │
│  │  Alice (BNY):        │  │  │ BNY      │ 🟢│ │
│  │  "Collateral terms   │  │  │ Goldman  │ 🟢│ │
│  │   look good. Moving  │  │  │ HQLAx   │ 🟡│ │
│  │   to lock."          │  │  │ Circle   │ ⚪│ │
│  │                      │  │  └──────────┘    │ │
│  │  Bob (Goldman):      │  │                  │ │
│  │  "Confirmed. Ready   │  │  FILES           │ │
│  │   to commit."        │  │  term_sheet.pdf  │ │
│  │                      │  │  risk_report.xlsx│ │
│  └──────────────────────┘  └──────────────────┘ │
│                                                  │
│  [Upload File]  [Change Status ▾]  [$CC Balance] │
└─────────────────────────────────────────────────┘
```

### Deal State Machine

This is the lifecycle every deal follows. In M2 it's PostgreSQL. In M3 it becomes Daml contracts.

```
DRAFT ──→ OPEN ──→ NEGOTIATING ──→ LOCKED ──→ COMMITTED
  │         │          │              │
  └─────────┴──────────┴──────────────┘
        (Admin can always reset to DRAFT)
```

| Transition | Who Can Do It | Rules |
|------------|--------------|-------|
| Draft → Open | Admin, Editor | — |
| Open → Negotiating | Admin, Editor | Requires ≥2 participants |
| Negotiating → Locked | Admin only | All parties must sign off |
| Locked → Committed | Admin only | Final state. $CC settles. |
| Any → Draft | Admin only | Reset / cancel |

### Subscription Tiers (How Flowryd Makes Money)

| Tier | Monthly ($CC) | What it unlocks |
|------|--------------|-----------------|
| **Discover** | $100 | Network grid, participant discovery, connection intelligence |
| **Navigate** | $250 | Flow builder, templates, join marketplace flows |
| **Activate** | $500 + 10% marketplace fee | Deploy on-chain, deal rooms, $CC settlement, FA Markers |

All payments are in **$CC (Canton Coin)**. This is important for the Daml contract design — subscription billing and deal settlement both use $CC.

### Featured App Markers (FA Markers)

When a workflow uses specific participants' apps (e.g., Chainlink for pricing, Circle for settlement), those apps earn **FA Markers** — reward tokens. Flowryd distributes revenue share to Featured Apps based on marker count and multiplier.

```
Example: "Token Issuance" workflow
  → Uses Chainlink (oracle) — earns 15% revenue share
  → Uses Circle (settlement) — earns 10% revenue share
  → Uses 5North (identity) — earns 5% revenue share
  → Flowryd keeps 70% orchestration fee
```

This incentive layer needs to be on-chain in M3.

---

## Part 2: What Flowryd Has Already Built (M2)

Everything below is **live and working**. IEU is NOT building from scratch.

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 19, Tailwind CSS 4, Framer Motion |
| Flow Canvas | @xyflow/react (drag-and-drop workflow builder) |
| Database | PostgreSQL (Neon serverless) |
| ORM | Drizzle ORM (type-safe) |
| Auth | Custom JWT (jose) with Canton Party-IDs |
| Real-time | Server-Sent Events + polling fallback |
| File Storage | Vercel Blob |
| Hosting | Vercel Edge |

### Database Schema (20+ tables)

Key tables relevant to IEU:

| Table | What it stores | M3 impact |
|-------|---------------|-----------|
| `organizations` | Multi-tenant org container | Party on Canton |
| `users` | Users with Canton Party-IDs | Daml Party identity |
| `flows` | Workflow definitions (draft/published/archived) | → `FlowWorkflow` Daml template |
| `flow_versions` | Append-only version snapshots (nodes/edges as JSON) | On-chain versioning |
| `flow_participants` | Which participants are in a flow | → Daml multi-party signatories |
| `deals` | Deal rooms with state machine | → `DealStateMachine` Daml template |
| `deal_participants` | Users in a deal with per-deal roles | → `DealParticipantAgreement` |
| `messages` | Chat messages with threading | Off-chain (stays in PostgreSQL) |
| `participants` | 80+ Canton ecosystem companies with claim/verify workflow | Directory data |
| `node_api_configs` | Per-org Canton node endpoint configuration | CBM connection info |
| `plans` / `subscriptions` / `invoices` | Billing ($CC) | → Daml subscription contracts |
| `payment_methods` | $CC wallet addresses | → Fireblocks vault mapping |

### Canton Service Interface (Already Defined)

Flowryd has a **`CantonService` interface** with 5 methods. Currently backed by a mock. IEU's Daml contracts will back the live implementation.

```typescript
interface CantonService {
  // Create a new Daml contract from a template
  deployContract(params: DeployContractParams): Promise<CantonTransactionReceipt>;
  
  // Exercise a choice on an existing contract (state transitions)
  submitTransaction(params: SubmitTransactionParams): Promise<CantonTransactionReceipt>;
  
  // Query $CC balance for a wallet
  getWalletBalance(walletAddress: string): Promise<CantonWalletBalance>;
  
  // Query active contract state
  getContractStatus(contractId: string): Promise<CantonContractStatus>;
  
  // Query Featured App marker rewards
  getFAMarkers(flowId: string): Promise<FAMarkerData[]>;
}
```

**Key types:**

```typescript
type CantonTransactionHash = `0x${string}`;
type CantonContractId = `canton::contract-${string}`;

interface DeployContractParams {
  templateId: string;          // Which Daml template to instantiate
  participants: string[];      // Canton Party IDs
  flowId?: string;             // Link to Flowryd flow
  metadata?: Record<string, unknown>;
}

interface SubmitTransactionParams {
  contractId: CantonContractId;  // Which contract to exercise on
  choice: string;                // Daml choice name (e.g., "LockDeal")
  argument: Record<string, unknown>;  // Choice arguments
  actAs: string;                 // Which party is exercising
}
```

### Pre-Built Workflows (Jumpstart Templates)

Flowryd ships with 3 workflow templates. Each defines stages, roles, and participant slots:

| Template | Stages | Roles Required |
|----------|--------|---------------|
| **Token Issuance** | Issuance → Distribution/Trading → Settlement/Custody | Issuer, Registry, Settlement, Custody, Wallet, Exchange, Liquidity Provider, Market Maker, Collateral Agent, Data Oracle, Payment/Stablecoin, Identity Provider |
| **Collateral Management** | Collateral Setup → Trading/Exposure → Settlement | Collateral Provider, Collateral Taker, Collateral Agent, Custody, Registry, Settlement, Liquidity Provider, Cash Lender, Data Oracle |
| **Repo Financing** | Collateral → Financing → Settlement/Closeout | Cash Lender, Cash Borrower, Repo Platform, Custody, Registry, Settlement, Collateral Agent, Collateral Provider, Data Oracle, Payment/Stablecoin |

Each workflow has:
- `stages[]` — ordered list of phases, each requiring specific roles
- `roles[]` — all participant roles needed across all stages
- `featuredApps[]` — which participants earn revenue share (FA Markers)
- `orchestrationFee` — Flowryd's cut of each deal
- `stackCategory` — DeFi / Custody / Compliance / Issuance / Custom

### 80+ Participant Directory

We have **82 Canton ecosystem participants** profiled with:

| Field | Example |
|-------|---------|
| `name` | "DTCC" |
| `cantonRole` | "Registry + Issuer" |
| `capabilities` | `{ Registry: 1, Settlement: 1 }` |
| `criticality` | "CRITICAL" / "REQUIRED" / "OPTIONAL" |
| `holdings` | "$45.2T" |
| `validatorNodes` | 4 |
| `superValidator` | false |

**Role distribution across participants:**

| Role Category | # of Companies | Examples |
|--------------|---------------|---------|
| Custody | 10 | Fireblocks, BNY, Copper, BitGo, Anchorage, Zodia |
| Liquidity / Market Making | 9 | Cumberland, Citadel, DRW, Wintermute, GSR |
| Tokenized Assets / Issuance | 10 | Securitize, Ondo, BlackRock, WisdomTree, Archax |
| Exchanges | 5 | HKEX, Nasdaq, Tradeweb, Coinbase, Kraken |
| Compliance | 5 | TRM Labs, Elliptic, Chainalysis, Lukka |
| Infrastructure | 5 | Digital Asset, Blockdaemon, IEU, 5North |
| Wallets | 6 | Safe, Dfns, 1Pilot, Loop, Cypherock |
| Identity | 4 | 5North, 7Trust, Quadrata, Veriff |
| Stablecoins / Payments | 4 | Circle, Paxos, Brale |
| Data / Oracle | 5 | Chainlink, Pyth, Coin Metrics, Kaiko, Noves |
| Registry / Settlement | 3 | DTCC, Euroclear, SIX |
| Other (Banking, Legal, Repo) | 6+ | Goldman, BNP, Standard Chartered, Broadridge |

### Canton Test Node (Already Running)

We have a CBM instance running at:
```
https://canton.test.catalyst.flowryd.xyz/api/swagger-ui/index.html
```

**CBM v1.11.1** — 126 API endpoints including:
- Participant management
- DAR upload/deployment
- JSON API proxy (Ledger API gateway)
- Validator management
- Domain connections

---

## Part 3: What IEU Needs to Deliver

### Overview

IEU delivers **Daml smart contracts** that make Flowryd's mock services real. Flowryd handles the app code, API wiring, and frontend. IEU handles the on-chain logic and CPM packaging.

### Deliverable 1: Core Workflow Contracts

These replace the PostgreSQL state machine with Daml contracts.

#### 1A: `DealStateMachine` Template

**What it replaces**: `deals` table + `deal_status` enum + `state-machine.ts`

```
Current PostgreSQL logic:
  deals.status = 'draft' | 'open' | 'negotiating' | 'locked' | 'committed'
  Transitions validated by state-machine.ts
  Permissions checked by role (admin/editor/viewer)

Needed Daml template:
  DealStateMachine with choices that enforce the same transitions
```

**Template fields:**
| Field | Type | From |
|-------|------|------|
| `dealId` | Text | `deals.id` |
| `flowId` | Optional Text | `deals.flow_id` |
| `orgParty` | Party | `deals.org_id` → organization's Canton Party |
| `title` | Text | `deals.title` |
| `description` | Optional Text | `deals.description` |
| `status` | DealStatus (enum) | `deals.status` |
| `creator` | Party | `deals.created_by` → user's Canton Party |
| `volume` | Optional Text | `deals.volume` |
| `metadata` | Optional (TextMap Text) | `deals.metadata` |
| `participants` | [Party] | From `deal_participants` |
| `createdAt` | Time | `deals.created_at` |

**Choices needed:**

| Choice | Who can exercise | Guard conditions | New status |
|--------|-----------------|-----------------|------------|
| `OpenDeal` | creator, any editor | status == draft | open |
| `StartNegotiation` | creator, any editor | status == open, participants ≥ 2 | negotiating |
| `LockDeal` | creator only (admin) | status == negotiating, all participants signed off | locked |
| `CommitDeal` | creator only (admin) | status == locked | committed → triggers $CC settlement |
| `ResetToDraft` | creator only (admin) | any status except committed | draft |
| `AddParticipant` | creator, any editor | status ∈ {draft, open} | (same status, updated participant list) |
| `RemoveParticipant` | creator, any editor | status ∈ {draft, open} | (same status, updated participant list) |

**On `CommitDeal`**: This should trigger the $CC settlement flow — orchestration fee to Flowryd, revenue shares to Featured Apps. This is the atomic settlement moment.

#### 1B: `DealParticipantAgreement` Template

**What it replaces**: `deal_participants` table

Each participant in a deal has an agreement contract. When a deal moves to `locked`, all participants must have signed off.

**Template fields:**
| Field | Type |
|-------|------|
| `dealContractId` | ContractId DealStateMachine |
| `participant` | Party |
| `role` | ParticipantRole (admin/editor/viewer) |
| `signedOff` | Bool |
| `joinedAt` | Time |

**Choices:**
| Choice | Who | What |
|--------|-----|------|
| `SignOff` | participant | Sets `signedOff = True`. Required before `LockDeal`. |
| `Withdraw` | participant | Removes participant from deal (creates archive). |

#### 1C: `FlowWorkflow` Template

**What it replaces**: `flows` table + `flow_versions` table

**Template fields:**
| Field | Type |
|-------|------|
| `flowId` | Text |
| `orgParty` | Party |
| `title` | Text |
| `description` | Optional Text |
| `status` | FlowStatus (draft/published/archived) |
| `stages` | [WorkflowStage] |
| `roles` | [Text] |
| `participants` | [Party] |
| `isTemplate` | Bool |
| `stackCategory` | Optional Text |
| `version` | Int |

**Choices:**
| Choice | Who | What |
|--------|-----|------|
| `Publish` | creator | status → published, visible in marketplace |
| `Archive` | creator | status → archived |
| `AddParticipant` | creator | Add party to participant list |
| `SaveVersion` | creator, editors | Create new version snapshot (append-only) |

---

### Deliverable 2: Payment & Settlement Contracts

#### 2A: `CCTransfer` Template

Handles atomic $CC movement between parties.

**Template fields:**
| Field | Type |
|-------|------|
| `sender` | Party |
| `receiver` | Party |
| `amount` | Decimal |
| `dealContractId` | Optional (ContractId DealStateMachine) |
| `memo` | Optional Text |
| `status` | TransferStatus (pending/completed/failed) |

**Choices:**
| Choice | Who | What |
|--------|-----|------|
| `InitiateTransfer` | sender | Creates the transfer, locks funds |
| `ConfirmSettlement` | receiver (or automated) | Confirms receipt, finalizes |

**Integration point**: This needs to work with **Splice Amulet** ($CC UTXO model). The transfer should consume Amulet Holding contracts and create new ones. Flowryd will handle the Fireblocks External Signing bridge — IEU just needs the Daml-side logic.

#### 2B: `OrchestratorFee` Template

Automatic fee distribution when a deal commits.

**Template fields:**
| Field | Type |
|-------|------|
| `dealContractId` | ContractId DealStateMachine |
| `totalAmount` | Decimal |
| `flowrydParty` | Party (Flowryd's fee collection party) |
| `flowrydShare` | Decimal (percentage) |
| `featuredApps` | [(Party, Decimal)] — (app party, revenue share %) |

**Choices:**
| Choice | Who | What |
|--------|-----|------|
| `DistributeFees` | flowrydParty | Splits `totalAmount` per percentages, creates `CCTransfer` for each |

#### 2C: `FAMarkerReward` Template

Tracks Featured App rewards earned per workflow.

**Template fields:**
| Field | Type |
|-------|------|
| `flowId` | Text |
| `appParty` | Party |
| `appName` | Text |
| `markerCount` | Int |
| `rewardCC` | Decimal |
| `multiplier` | Int (1–100) |

**Choices:**
| Choice | Who | What |
|--------|-----|------|
| `AccumulateMarkers` | flowrydParty | Increment marker count when app is used in a deal |
| `DistributeRewards` | flowrydParty | Convert markers to $CC, create CCTransfer to app party |

---

### Deliverable 3: Role Templates (12 packages)

These are **installable Daml packages** — one per role category. A company installs the role package for their function and becomes eligible to participate in workflows requiring that role.

Think of it like installing an app: Fireblocks installs the "Custody Role" package, and now any Flowryd workflow that needs a custodian can select Fireblocks.

| # | Role Template | What it defines | Example companies |
|---|--------------|----------------|-------------------|
| 1 | **Custody Role** | Asset safekeeping, key management, withdrawal authorization | Fireblocks, Copper, BitGo, BNY, Anchorage, Zodia |
| 2 | **Liquidity Provider** | Market making, liquidity provision, price quoting | Cumberland, Citadel, DRW, Wintermute, GSR |
| 3 | **Compliance Check** | AML/KYC screening, sanctions check, risk scoring | TRM Labs, Elliptic, Chainalysis, Lukka |
| 4 | **Issuer Role** | Token creation, lifecycle management, corporate actions | Securitize, Fairmint, Ondo, Archax |
| 5 | **Settlement Rail** | Payment routing, stablecoin settlement, fiat on/off ramp | Circle, Paxos, Brale |
| 6 | **Oracle / Pricing** | Price feeds, reference data, market data | Chainlink, Pyth, Coin Metrics, Kaiko |
| 7 | **Identity Provider** | KYC verification, credential issuance, identity attestation | 5North, 7Trust, Quadrata, Veriff |
| 8 | **Registry Role** | Record keeping, transfer agent, beneficial ownership | DTCC, Euroclear, Nasdaq |
| 9 | **Collateral Agent** | Collateral valuation, margin calls, substitution | HQLAx, Euroclear, BNY |
| 10 | **Exchange Role** | Order matching, listing, trading venue | Tradeweb, HKEX, Coinbase, Kraken |
| 11 | **Wallet Provider** | Key management, transaction signing, wallet UX | Safe, Dfns, 1Pilot, Cypherock |
| 12 | **Data Provider** | On-chain analytics, transaction translation, telemetry | Noves, ALUM Labs, Chainalysis, Chata |

**Each role template should include:**

```
RoleTemplate
├── role_definition.daml     — What capabilities this role declares
├── role_registration.daml   — How a company "installs" this role
├── role_interface.daml      — Standard interface other contracts call
└── test/                    — Daml test scenarios
```

**Choices per role template:**
| Choice | What |
|--------|------|
| `InstallRole` | Company installs the package, declares they fill this role |
| `ActivateRole` | Role goes live, company appears in Flowryd's Discover grid for this role |
| `DeactivateRole` | Company stops filling this role |
| `FulfillObligation` | Role-specific: custody → hold assets, compliance → return check result, oracle → provide price |

---

### Deliverable 4: Adapter Patterns (5 bridges)

These are Daml templates that bridge off-chain services to on-chain contracts. Will builds the off-chain service wrapper; IEU builds the Daml-side receiver.

| # | Adapter | What Daml needs | Off-chain source (Will builds) |
|---|---------|----------------|-------------------------------|
| 1 | **Oracle Price Feed** | Template that accepts price updates, validates source party, stores latest price. Other contracts can read it. | Chainlink/Pyth API → Flowryd service → Daml `UpdatePrice` choice |
| 2 | **Compliance Gate** | Template that blocks deal progression until a compliance check passes. Accepts check results from authorized compliance party. | TRM Labs API → Flowryd service → Daml `SubmitCheckResult` choice |
| 3 | **Identity Credential** | Template that stores KYC verification result for a party. Other contracts can query it. | 5North 5N ID → Flowryd service → Daml `IssueCredential` choice |
| 4 | **Payment Rail** | Template that bridges $CC settlement to stablecoin rails. | Circle/Paxos API → Flowryd service → Daml `ConfirmPayment` choice |
| 5 | **Data Feed** | Template that accepts arbitrary data updates (analytics, health, etc.). | Noves/ALUM API → Flowryd service → Daml `UpdateData` choice |

---

### Deliverable 5: CPM Packaging

Once contracts are written and tested, package them for Catalyst Package Manager:

| Package | Contents | Target |
|---------|----------|--------|
| `flowryd-core` | DealStateMachine, FlowWorkflow, CCTransfer, OrchestratorFee, FAMarkerReward | Every Flowryd user's validator |
| `flowryd-custody-role` | Custody Role template | Companies filling custody role |
| `flowryd-liquidity-role` | Liquidity Provider template | Companies filling liquidity role |
| ... (one per role) | ... | ... |
| `flowryd-adapters` | All 5 adapter patterns | Flowryd's own validator |

**Packaging format**: DAR files compatible with CPM. Installable via:
```
cpm install flowryd-core
cpm install flowryd-custody-role
```

---

## Part 4: What Flowryd Builds (Will's Side)

So IEU knows what they're integrating with:

| Component | What Will builds | IEU dependency |
|-----------|-----------------|----------------|
| `LiveCantonService` | TypeScript class calling Ledger API via CBM JSON proxy | Needs Daml templates deployed to testnet |
| Ledger Event Subscription | Listens to Canton transaction stream, mirrors state to PostgreSQL | Needs contracts exercisable |
| Fireblocks Bridge | Off-chain service that forwards signing requests to Fireblocks MPC | Needs CCTransfer template |
| Adapter Services | Off-chain wrappers for Chainlink, TRM, 5North, etc. | Needs adapter Daml templates |
| CPM Client | API calls to check/install packages from Flowryd's UI | Needs CPM packages published |
| Onboarding Portal | Web UI for partners to claim profiles | No IEU dependency |
| Identity Verification | 5North + 7Trust API integration in Flowryd | No IEU dependency |

---

## Part 5: Timeline & Coordination

### What IEU delivers, when:

| Week | IEU Deliverable | Will needs it for |
|------|----------------|-------------------|
| **Week 1** | Confirm test node ownership, provide Participant ID | Node configuration |
| **Week 2** | CBM access credentials, Ledger API auth setup | Ledger API proxy testing |
| **Week 3** | Start Daml contract development (Will provides full spec above) | — |
| **Week 5** | `DealStateMachine` + `DealParticipantAgreement` deployed to testnet | LiveCantonService wiring |
| **Week 6** | `FlowWorkflow` + `CCTransfer` + `OrchestratorFee` deployed | Settlement testing |
| **Week 7** | Role templates (12) deployed | CPM integration |
| **Week 8** | Adapter patterns (5) deployed + CPM packages published | Full E2E testing |
| **Week 10** | Mainnet deployment support | Production launch |
| **Week 14** | Daml contract security review | Launch gate |

### Communication Protocol

| What | How | Frequency |
|------|-----|-----------|
| Progress updates | Slack / shared channel | Daily standups (async) |
| Contract review | PR reviews on shared Daml repo | Per template |
| Testnet deployment | IEU deploys DARs to CBM, notifies Will | Per milestone |
| Issues / blockers | Direct Slack message + email | Immediately |
| Architecture decisions | 30-min call | As needed |

### Shared Repo Structure (Suggested)

```
flowryd-daml/
├── daml.yaml                    — Project config
├── src/
│   ├── Flowryd/
│   │   ├── Deal.daml            — DealStateMachine + DealParticipantAgreement
│   │   ├── Flow.daml            — FlowWorkflow
│   │   ├── Payment.daml         — CCTransfer + OrchestratorFee
│   │   ├── Marker.daml          — FAMarkerReward
│   │   └── Types.daml           — Shared types (DealStatus, ParticipantRole, etc.)
│   ├── Roles/
│   │   ├── Custody.daml
│   │   ├── Liquidity.daml
│   │   ├── Compliance.daml
│   │   ├── Issuer.daml
│   │   ├── Settlement.daml
│   │   ├── Oracle.daml
│   │   ├── Identity.daml
│   │   ├── Registry.daml
│   │   ├── Collateral.daml
│   │   ├── Exchange.daml
│   │   ├── Wallet.daml
│   │   └── Data.daml
│   └── Adapters/
│       ├── OracleAdapter.daml
│       ├── ComplianceGate.daml
│       ├── IdentityCredential.daml
│       ├── PaymentRail.daml
│       └── DataFeed.daml
├── test/
│   ├── DealTest.daml
│   ├── FlowTest.daml
│   ├── PaymentTest.daml
│   └── RoleTest.daml
└── deploy/
    ├── cpm-core.yaml
    └── cpm-roles.yaml
```

---

## Part 6: Questions for IEU

1. **Test node confirmation**: Is `canton.test.catalyst.flowryd.xyz` our dedicated testnet node? What's the Participant ID?

2. **Daml version**: Which Daml SDK version should we target? (We assume Daml 3.x / Canton 3.x)

3. **Splice Amulet integration**: How do we integrate CCTransfer with Splice Amulet's UTXO model? Do you have experience with `AmuletRules` contracts?

4. **Multi-party privacy**: For the DealStateMachine, only deal participants should see the contract. How should we set up the Daml privacy model? (Observers vs. signatories)

5. **CPM timeline**: When can we have the first DAR package in CPM for testing?

6. **Fireblocks topology**: Have you done Canton External Signing (Fireblocks-managed parties) before? We'll need help with `NamespaceDelegation` / `PartyToKeyMapping` topology transactions.

7. **Shared repo**: Where should the Daml code live? Separate repo? Monorepo? Who has write access?

8. **Canton Network fees**: What are the transaction costs on the Global Synchronizer? Per-transaction pricing for $CC transfers?

---

## Appendix: Key File References in Flowryd Codebase

If IEU wants to understand the existing code:

| File | What it shows |
|------|--------------|
| `src/lib/canton/interface.ts` | CantonService interface (5 methods) — what IEU's contracts need to support |
| `src/lib/canton/types.ts` | All Canton-related TypeScript types |
| `src/lib/canton/mock.ts` | Mock implementation — shows expected behavior |
| `src/lib/canton/index.ts` | Factory pattern with `CANTON_MODE` switch |
| `src/lib/canton-data.ts` | 82 participants + 3 workflow templates + types |
| `src/lib/deals/state-machine.ts` | Deal state transition logic (42 lines) — Daml must replicate this |
| `src/db/schema.ts` | Full database schema (393 lines) — reference for Daml field mapping |
| `src/lib/billing/types.ts` | Subscription tiers and pricing |
| `ARCHITECTURE.md` | Full M2 architecture document |
| `M3_ROADMAP.md` | M3 roadmap with IEU responsibilities |
