# Private Canvas Specification
## Design Partner Flow Prototyping Tool

**Version:** 1.0  
**Date:** January 31, 2026  
**Purpose:** Enable 2-3 design partners to model workflows on Flowryd

---

## CONCEPT

The Private Canvas is where design partners create, model, and coordinate workflows before they go live. It's private by default - only the creator sees it until they invite parties.

From the Texture deck:
> "You click 'New Flow' and land on a blank canvas. This is YOUR workflow — private until you choose to share it."

---

## MVP SCOPE: What Texture Needs

### Flow 001: DAT Tokenization + Crypto Redemption

**Texture's client:** Treasury company with 80 PoS validator nodes  
**Goal:** Tokenize equity on Canton with crypto basket redemption feature

**Roles Required:**

| Role | Party | Status |
|------|-------|--------|
| Issuer | Treasury Client | KNOWN |
| Broker-Dealer | Texture Capital | FILLED (self) |
| Transfer Agent | Texture Capital | FILLED (self) |
| ATS Operator | Texture Capital | FILLED (self) |
| Crypto Custodian | TBD | GAP → Send Offers |
| Price Oracle | TBD | GAP → Send Offers |
| Compliance Provider | TBD | GAP → Send Offers |

**Canvas Actions Needed:**
1. Create new private flow
2. Add known parties (Issuer, self-roles)
3. Define GAP roles with requirements
4. Search/browse candidates for GAP roles
5. Send Flow Offers to candidates
6. Track Offer status (Pending/Accepted/Countered/Declined)
7. See when flow is "ready" (all roles filled)

---

## PRIVATE CANVAS: USER EXPERIENCE

### Screen 1: My Flows Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│  🔒 MY PRIVATE FLOWS                          [+ New Flow]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Flow_DAT_Tokenization                    DRAFT      │   │
│  │ 7 roles • 4 filled • 3 gaps             Created 2d │   │
│  │ [Open Canvas]                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Flow_MMF_Trading                         DRAFT      │   │
│  │ 5 roles • 2 filled • 3 gaps             Created 5d │   │
│  │ [Open Canvas]                                       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 2: Private Canvas (Flow Builder)

```
┌─────────────────────────────────────────────────────────────────────┐
│  Flow_DAT_Tokenization                    [Save] [Preview] [Publish]│
│  Status: DRAFT • 4/7 roles filled                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                                                              │  │
│  │         ┌──────────┐                                         │  │
│  │         │ ISSUER   │                                         │  │
│  │         │ Treasury │ ← KNOWN                                 │  │
│  │         │ Co.      │                                         │  │
│  │         └────┬─────┘                                         │  │
│  │              │                                               │  │
│  │    ┌─────────┼─────────┐                                     │  │
│  │    │         │         │                                     │  │
│  │    ▼         ▼         ▼                                     │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐                                   │  │
│  │ │BROKER│ │TRANSF│ │ ATS  │                                   │  │
│  │ │DEALER│ │AGENT │ │ OPR  │ ← ALL TEXTURE (FILLED)            │  │
│  │ │Texture│ │Texture│ │Texture│                                 │  │
│  │ └──────┘ └──────┘ └──────┘                                   │  │
│  │                                                              │  │
│  │    ┌─────────┴─────────┐                                     │  │
│  │    │         │         │                                     │  │
│  │    ▼         ▼         ▼                                     │  │
│  │ ┌──────┐ ┌──────┐ ┌──────┐                                   │  │
│  │ │CRYPTO│ │PRICE │ │COMPLI│                                   │  │
│  │ │CUSTOD│ │ORACLE│ │ANCE  │ ← GAP ROLES                       │  │
│  │ │ ??? │ │ ??? │ │ ??? │                                   │  │
│  │ │[FIND]│ │[FIND]│ │[FIND]│                                   │  │
│  │ └──────┘ └──────┘ └──────┘                                   │  │
│  │                                                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ROLE DETAILS                                                       │
│  ─────────────────────────────────────────────────────────────────  │
│  Selected: Crypto Custodian [GAP]                                   │
│  Requirements: Multi-coin custody (80+ PoS tokens)                  │
│  Candidates found: 3                                                │
│  [Send Offer to Anchorage] [Send Offer to BitGo] [Send Offer to X]  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Screen 3: Send Flow Offer

```
┌─────────────────────────────────────────────────────────────┐
│  SEND FLOW OFFER                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  To: Anchorage Digital                                      │
│  Role: Crypto Custodian                                     │
│  Flow: DAT Tokenization + Arbitrage                         │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Requirements:                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ • Multi-coin custody (80+ PoS tokens)               │   │
│  │ • Canton Network Party-ID required                  │   │
│  │ • Insurance coverage: $X minimum                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Reward Pool Share: [________] % (negotiable)              │
│                                                             │
│  Offer Expiry: [Feb 15, 2026 ▼]                            │
│                                                             │
│  Message (optional):                                        │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ We're building a first-of-kind DAT tokenization     │   │
│  │ with crypto redemption. Looking for custody         │   │
│  │ partner with multi-chain experience...              │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│           [Cancel]                    [Send Offer →]        │
│                                                             │
│  ⓘ This creates an on-chain offer contract.               │
│    Recipient can Accept, Counter, or Decline.              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 4: Offer Tracking

```
┌─────────────────────────────────────────────────────────────┐
│  FLOW OFFERS SENT                           Flow: DAT_Token │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Crypto Custodian                                           │
│  ├── Anchorage Digital    [PENDING]     Sent Jan 31        │
│  ├── BitGo                [COUNTERED]   Counter: 8% share  │
│  └── Fireblocks           [DECLINED]    "Capacity full"    │
│                                                             │
│  Price Oracle                                               │
│  ├── Kaiko                [ACCEPTED ✓]  5% share agreed    │
│  └── Chainlink            [PENDING]     Sent Jan 30        │
│                                                             │
│  Compliance Provider                                        │
│  └── C7 Trust             [PENDING]     Sent Jan 31        │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  FLOW STATUS: 5/7 roles filled                              │
│  Ready to Activate: NO (2 gaps remaining)                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Screen 5: Flow Ready → Activate

```
┌─────────────────────────────────────────────────────────────┐
│  🎉 FLOW READY TO ACTIVATE                                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Flow_DAT_Tokenization                                      │
│  All 7 roles filled ✓                                       │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  PARTICIPANTS                         REWARD SHARE          │
│  Issuer: Treasury Co.                      15%              │
│  Broker-Dealer: Texture                    25%              │
│  Transfer Agent: Texture                   10%              │
│  ATS Operator: Texture                     10%              │
│  Crypto Custodian: BitGo                   15%              │
│  Price Oracle: Kaiko                        5%              │
│  Compliance: C7 Trust                      10%              │
│  Flowryd (orchestration)                   10%              │
│                                           ────              │
│                                           100%              │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  Estimated Daily On-chain Commits: 83 - 8,360               │
│  Potential FA Reward Pool: TBC (per app marker rates)       │
│  Target Execution Date: [Select Date]                       │
│                                                             │
│        [Save as Template]           [ACTIVATE FLOW →]       │
│                                                             │
│  ⓘ Activating deploys on-chain contracts for all parties.  │
│    CC rewards begin flowing upon first transaction.         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## DATA MODEL (For DAML Contracts)

### PrivateFlow Contract

```
template PrivateFlow
  with
    flowId : Text
    creator : Party
    flowName : Text
    flowDescription : Text
    status : FlowStatus  -- DRAFT | RECRUITING | READY | ACTIVE
    roles : [FlowRole]
    createdAt : Time
    updatedAt : Time
  where
    signatory creator
    
    choice AddRole : ContractId PrivateFlow
      with
        roleName : Text
        requirements : Text
        rewardShare : Optional Decimal
      controller creator
      do
        -- Add role logic
        
    choice SendOffer : ContractId FlowOffer
      with
        roleId : Text
        targetParty : Party
        offerTerms : OfferTerms
      controller creator
      do
        -- Create offer contract
```

### FlowRole

```
data FlowRole = FlowRole
  { roleId : Text
  , roleName : Text
  , requirements : Text
  , status : RoleStatus  -- GAP | OFFER_SENT | FILLED
  , filledBy : Optional Party
  , rewardShare : Optional Decimal
  }
```

### FlowOffer Contract

```
template FlowOffer
  with
    offerId : Text
    flowId : Text
    fromParty : Party
    toParty : Party
    roleName : Text
    requirements : Text
    proposedRewardShare : Decimal
    expiryDate : Date
    status : OfferStatus  -- PENDING | ACCEPTED | COUNTERED | DECLINED
    message : Optional Text
  where
    signatory fromParty
    observer toParty
    
    choice Accept : ContractId FlowCommit
      controller toParty
      do
        -- Create commit, update flow
        
    choice Counter : ContractId FlowOffer
      with
        counterShare : Decimal
        counterMessage : Text
      controller toParty
      do
        -- Create counter-offer
        
    choice Decline : ()
      with
        reason : Optional Text
      controller toParty
      do
        -- Archive offer
```

---

## MVP IMPLEMENTATION PATH

### Option A: Full DAML (Preferred)
- All canvas state lives on-chain
- Offers/commits are Canton contracts
- IEU validates + deploys
- **Timeline:** 3-4 weeks with IEU

### Option B: Hybrid (Faster but Less Pure)
- Canvas state in database (Postgres/Airtable)
- Only Offers/Commits go on-chain
- Frontend talks to API + Canton
- **Timeline:** 2-3 weeks

### Option C: Concierge (Fastest)
- Canvas is Figma/Notion board
- Liz manually creates on-chain offers
- Design partners see results in shared dashboard
- **Timeline:** 1 week
- **Use for:** First 1-2 prototypes while building Option A

**Recommendation:** Start with Option C for Texture NOW, build Option A in parallel.

---

## TEXTURE PROTOTYPE CHECKLIST

### Week 1: Concierge Setup
- [ ] Texture subscribes ($100 CC via manual process)
- [ ] Create shared Notion/Figma canvas for DAT flow
- [ ] Texture identifies parties for each role
- [ ] Liz creates on-chain offers manually (with IEU support)

### Week 2-3: Track + Learn
- [ ] Monitor offer responses
- [ ] Document friction points
- [ ] Capture what Texture needs that we don't have
- [ ] Feed learnings into Option A spec

### Week 4+: Production Canvas
- [ ] IEU deploys DAML canvas contracts
- [ ] Will builds UI against contracts
- [ ] Migrate Texture from concierge to production
- [ ] Onboard design partners 2 and 3

---

## 2-3 PROTOTYPE FLOWS

### Prototype 1: Texture - DAT Tokenization
- **Complexity:** High (7 parties, novel structure)
- **Value:** First-of-kind, template creation opportunity
- **Status:** Ready to start

### Prototype 2: TBD - Repo Financing
- **Complexity:** Medium (5 parties, known pattern)
- **Value:** Validates repo use case from DAML library
- **Candidate Partners:** [To identify]

### Prototype 3: TBD - ETF Arbitrage or MMF Trading
- **Complexity:** High (10+ parties, high TPS)
- **Value:** Tests scale assumptions
- **Candidate Partners:** [To identify]

---

## SUCCESS METRICS

**For Private Canvas MVP:**
- [ ] Texture creates flow in < 30 minutes
- [ ] Offers sent within 24 hours of canvas completion
- [ ] 50%+ offer acceptance rate
- [ ] Flow moves to READY status within 2 weeks
- [ ] First on-chain activation within 30 days

**For Design Partner Program:**
- [ ] 2-3 partners actively prototyping by end of Feb
- [ ] 1+ flow reaches ACTIVE status by end of March
- [ ] Template library started (reusable patterns)
- [ ] Design partners willing to pay full Navigate tier ($300+)

---

*This spec is intentionally tight. Build only what's needed to get Texture through one complete D-N-A cycle.*
