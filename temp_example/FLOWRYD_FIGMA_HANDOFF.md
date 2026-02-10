# Figma Handoff: Private Canvas Components
## For Will - Frontend Automation Ready

**Purpose:** Build these components in Figma → Export to code via Figma Dev Mode / plugins  
**Design System:** Matches existing flowryd-discover-wireframe.html tokens  
**Target:** React + Tailwind (existing stack)

---

## DESIGN TOKENS (Already Defined)

```javascript
// Use these exact values in Figma
colors: {
  'fr-bg': '#09090b',        // Background
  'fr-card': '#18181b',      // Card backgrounds
  'fr-border': '#27272a',    // Borders
  'fr-accent': '#3b82f6',    // Primary blue
  'fr-success': '#22c55e',   // Success green
  'fr-warning': '#eab308',   // Warning yellow
  'fr-purple': '#8b5cf6',    // Secondary purple
  'fr-cyan': '#06b6d4',      // Accent cyan
  'fr-muted': '#a1a1aa',     // Muted text
  'fr-dim': '#71717a',       // Dimmer text
  'fr-c7': '#6366f1'         // C7 Trust purple
}

typography: {
  font: 'Inter',
  weights: [300, 400, 500, 600, 700]
}

spacing: {
  // Tailwind default scale
  // 4px base (p-1), 8px (p-2), 12px (p-3), 16px (p-4), 24px (p-6), etc.
}

borderRadius: {
  'sm': '4px',
  'md': '8px',
  'lg': '12px',
  'xl': '16px',
  '2xl': '20px',
  'full': '9999px'
}
```

---

## COMPONENT INVENTORY

### Layer 0: Primitives (Already Exist)

| Component | Figma Name | Notes |
|-----------|------------|-------|
| Button/Primary | `btn-primary` | Blue bg, white text |
| Button/Secondary | `btn-secondary` | Transparent, border |
| Button/Ghost | `btn-ghost` | No border, hover state |
| Input/Text | `input-text` | Dark bg, border |
| Badge/Status | `badge-{status}` | success, warning, pending |
| Badge/VP | `badge-vp` | C7 Verified badge |
| Card | `card-base` | fr-card bg, border |
| Avatar | `avatar-{size}` | sm/md/lg with initials |

### Layer 1: Private Canvas Components (NEW)

---

## NEW COMPONENTS TO BUILD

### 1. FlowCard

**Figma Name:** `canvas/flow-card`  
**Used In:** My Flows Dashboard

```
┌─────────────────────────────────────────────────────┐
│ [Icon]  Flow_DAT_Tokenization           [DRAFT ▼]  │  ← Status badge
│         7 roles • 4 filled • 3 gaps                │  ← Meta line
│         Created 2 days ago                         │  ← Timestamp
│                                     [Open Canvas]  │  ← Action button
└─────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface FlowCardProps {
  flowId: string;
  flowName: string;
  status: 'DRAFT' | 'RECRUITING' | 'READY' | 'ACTIVE';
  totalRoles: number;
  filledRoles: number;
  gapRoles: number;
  createdAt: Date;
  onClick: () => void;
}
```

**States:**
- Default
- Hover (border-fr-accent)
- Selected (glow effect)

**Figma Variants:**
- Status: Draft / Recruiting / Ready / Active
- State: Default / Hover / Selected

---

### 2. RoleNode

**Figma Name:** `canvas/role-node`  
**Used In:** Flow Canvas (draggable)

```
┌──────────────┐
│   [ICON]     │  ← Role type icon
│   BROKER     │  ← Role name
│   DEALER     │  ← (two lines if needed)
│              │
│   Texture    │  ← Party name (if filled)
│   [FILLED]   │  ← Status indicator
└──────────────┘
```

**Props:**
```typescript
interface RoleNodeProps {
  roleId: string;
  roleName: string;
  roleType: 'issuer' | 'broker' | 'custodian' | 'oracle' | 'compliance' | 'other';
  status: 'FILLED' | 'GAP' | 'OFFER_SENT' | 'KNOWN';
  partyName?: string;
  partyAvatar?: string;
  isSelected: boolean;
  onClick: () => void;
}
```

**States:**
- GAP (dashed border, "?" icon, [FIND] button)
- OFFER_SENT (dashed border, pulsing, party name pending)
- FILLED (solid border, green indicator, party name)
- KNOWN (solid border, blue indicator, party name)
- Selected (any above + highlight ring)

**Figma Variants:**
- Status: Gap / OfferSent / Filled / Known
- Selected: Yes / No
- Size: Default / Compact

---

### 3. ConnectionLine

**Figma Name:** `canvas/connection-line`  
**Used In:** Flow Canvas (between nodes)

```
──────────────  (solid: confirmed connection)
- - - - - - -   (dashed: pending/potential)
```

**Props:**
```typescript
interface ConnectionLineProps {
  fromNodeId: string;
  toNodeId: string;
  status: 'confirmed' | 'pending';
  animated?: boolean;
}
```

---

### 4. RoleDetailPanel

**Figma Name:** `canvas/role-detail-panel`  
**Used In:** Flow Canvas (right sidebar or bottom panel)

```
┌─────────────────────────────────────────────────────┐
│ ROLE DETAILS                              [×]      │
├─────────────────────────────────────────────────────┤
│ Crypto Custodian                          [GAP]    │
│                                                     │
│ Requirements:                                       │
│ ┌─────────────────────────────────────────────────┐│
│ │ • Multi-coin custody (80+ PoS tokens)          ││
│ │ • Canton Network Party-ID required             ││
│ │ • Insurance coverage: $10M minimum             ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Reward Share: [____15____] %                       │
│                                                     │
│ Candidates Found: 3                                 │
│ ┌────────────────┐ ┌────────────────┐             │
│ │ Anchorage      │ │ BitGo          │ ...         │
│ │ [Send Offer]   │ │ [Send Offer]   │             │
│ └────────────────┘ └────────────────┘             │
└─────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface RoleDetailPanelProps {
  role: FlowRole;
  candidates: Party[];
  onSendOffer: (partyId: string) => void;
  onUpdateRequirements: (req: string) => void;
  onUpdateRewardShare: (share: number) => void;
  onClose: () => void;
}
```

---

### 5. OfferCard

**Figma Name:** `canvas/offer-card`  
**Used In:** Send Offer Modal, Offer Tracking

```
┌─────────────────────────────────────────────────────┐
│ FLOW OFFER                                         │
├─────────────────────────────────────────────────────┤
│ To: [Avatar] Anchorage Digital                     │
│ Role: Crypto Custodian                             │
│ Flow: DAT Tokenization + Arbitrage                 │
│                                                     │
│ Reward Share: 15%                                  │
│ Expiry: Feb 15, 2026                               │
│ Status: [PENDING]                                  │
│                                                     │
│ [View Details]                    [Withdraw Offer] │
└─────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface OfferCardProps {
  offerId: string;
  toParty: Party;
  roleName: string;
  flowName: string;
  rewardShare: number;
  expiryDate: Date;
  status: 'PENDING' | 'ACCEPTED' | 'COUNTERED' | 'DECLINED' | 'EXPIRED';
  counterOffer?: { share: number; message: string };
  onViewDetails: () => void;
  onWithdraw?: () => void;
  onAcceptCounter?: () => void;
}
```

**States:**
- Pending (yellow indicator)
- Accepted (green indicator, checkmark)
- Countered (purple indicator, counter details shown)
- Declined (red indicator, reason shown)
- Expired (gray, dimmed)

---

### 6. SendOfferModal

**Figma Name:** `canvas/send-offer-modal`  
**Used In:** When clicking "Send Offer" on candidate

```
┌─────────────────────────────────────────────────────┐
│ SEND FLOW OFFER                            [×]     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ To: [Avatar] Anchorage Digital                     │
│ Role: Crypto Custodian                             │
│ Flow: DAT Tokenization + Arbitrage                 │
│                                                     │
│ ───────────────────────────────────────────────── │
│                                                     │
│ Requirements:                                       │
│ ┌─────────────────────────────────────────────────┐│
│ │ • Multi-coin custody (80+ PoS tokens)          ││
│ │ • Canton Network Party-ID required             ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Reward Share:  [________] %  (negotiable)         │
│                                                     │
│ Expiry Date:   [Feb 15, 2026 ▼]                   │
│                                                     │
│ Message (optional):                                │
│ ┌─────────────────────────────────────────────────┐│
│ │                                                 ││
│ │                                                 ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ ⓘ This creates an on-chain offer contract.        │
│                                                     │
│              [Cancel]           [Send Offer →]     │
└─────────────────────────────────────────────────────┘
```

---

### 7. OfferReceivedCard (Recipient View)

**Figma Name:** `canvas/offer-received-card`  
**Used In:** Inbox / Notifications

```
┌─────────────────────────────────────────────────────┐
│ 📩 NEW FLOW OFFER                                  │
├─────────────────────────────────────────────────────┤
│ From: [Avatar] Texture Capital                     │
│ Flow: DAT Tokenization + Arbitrage                 │
│ Role: Crypto Custodian                             │
│                                                     │
│ Requirements:                                       │
│ • Multi-coin custody (80+ PoS tokens)             │
│                                                     │
│ Proposed Reward Share: 15%                         │
│ Expires: Feb 15, 2026                              │
│                                                     │
│ Message:                                           │
│ "We're building a first-of-kind DAT..."           │
│                                                     │
│   [DECLINE]     [COUNTER]     [ACCEPT ✓]          │
└─────────────────────────────────────────────────────┘
```

---

### 8. FlowSummaryCard

**Figma Name:** `canvas/flow-summary-card`  
**Used In:** Flow Ready state, pre-Activate

```
┌─────────────────────────────────────────────────────┐
│ 🎉 FLOW READY TO ACTIVATE                          │
├─────────────────────────────────────────────────────┤
│ Flow_DAT_Tokenization                              │
│ All 7 roles filled ✓                               │
│                                                     │
│ PARTICIPANTS              REWARD SHARE             │
│ ────────────────────────────────────               │
│ Issuer: Treasury Co.           15%                 │
│ Broker-Dealer: Texture         25%                 │
│ Transfer Agent: Texture        10%                 │
│ ATS Operator: Texture          10%                 │
│ Crypto Custodian: BitGo        15%                 │
│ Price Oracle: Kaiko             5%                 │
│ Compliance: C7 Trust           10%                 │
│ Flowryd (orchestration)        10%                 │
│                               ────                 │
│                               100%                 │
│                                                     │
│ Est. Daily Commits: 83 - 8,360                     │
│ Target Date: [Select ▼]                            │
│                                                     │
│   [Save as Template]        [ACTIVATE FLOW →]      │
└─────────────────────────────────────────────────────┘
```

---

## SCREEN COMPOSITIONS

### Screen 1: My Flows Dashboard

**Figma Frame:** `screens/my-flows-dashboard`  
**Size:** 1440 x 900 (desktop)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Header - existing component]                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔒 MY PRIVATE FLOWS                    [+ New Flow]       │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   FlowCard      │  │   FlowCard      │  ...             │
│  │   (component)   │  │   (component)   │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│                                                             │
│  📨 INCOMING OFFERS (3)                                    │
│                                                             │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │ OfferReceived   │  │ OfferReceived   │  ...             │
│  │ Card            │  │ Card            │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Data Bindings:**
```typescript
// API call: GET /api/flows/mine
flows: PrivateFlow[]

// API call: GET /api/offers/received
incomingOffers: FlowOffer[]
```

---

### Screen 2: Private Canvas (Flow Builder)

**Figma Frame:** `screens/private-canvas`  
**Size:** 1440 x 900 (desktop)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Header]                                                    │
├───────────────────────────────────────────┬─────────────────┤
│                                           │                 │
│  Flow Name: [editable]     [Save][Preview]│  ROLE DETAILS   │
│                                           │  (RoleDetail    │
│  ┌─────────────────────────────────────┐ │   Panel)        │
│  │                                     │ │                 │
│  │    [RoleNode]                       │ │  Selected:      │
│  │        │                            │ │  Crypto         │
│  │    ┌───┴───┐                        │ │  Custodian      │
│  │    │       │                        │ │                 │
│  │ [Node] [Node] [Node]                │ │  Requirements:  │
│  │    │       │                        │ │  • xxx          │
│  │    ┌───┴───┐                        │ │                 │
│  │    │       │                        │ │  Candidates:    │
│  │ [Node] [Node] [Node]                │ │  [Card][Card]   │
│  │  GAP    GAP   GAP                   │ │                 │
│  │                                     │ │                 │
│  └─────────────────────────────────────┘ │                 │
│                                           │                 │
│  Status: 4/7 filled                      │                 │
│                                           │                 │
└───────────────────────────────────────────┴─────────────────┘
```

**Data Bindings:**
```typescript
// API call: GET /api/flows/:flowId
currentFlow: PrivateFlow

// Derived
selectedRole: FlowRole | null

// API call: GET /api/parties/search?capability=:roleType
candidates: Party[]
```

---

### Screen 3: Offer Tracking

**Figma Frame:** `screens/offer-tracking`  
**Size:** 1440 x 900 (desktop)

**Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Header]                                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  FLOW OFFERS SENT              Flow: [Dropdown ▼]          │
│                                                             │
│  Crypto Custodian (3 sent)                                 │
│  ├── [OfferCard - Anchorage - PENDING]                     │
│  ├── [OfferCard - BitGo - COUNTERED]                       │
│  └── [OfferCard - Fireblocks - DECLINED]                   │
│                                                             │
│  Price Oracle (2 sent)                                      │
│  ├── [OfferCard - Kaiko - ACCEPTED ✓]                      │
│  └── [OfferCard - Chainlink - PENDING]                     │
│                                                             │
│  Compliance Provider (1 sent)                               │
│  └── [OfferCard - C7 Trust - PENDING]                      │
│                                                             │
│  ─────────────────────────────────────────────────────     │
│  FLOW STATUS: 5/7 roles filled                             │
│  Ready to Activate: NO (2 gaps remaining)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## FIGMA FILE STRUCTURE

```
Flowryd Private Canvas
├── 🎨 Design Tokens
│   ├── Colors
│   ├── Typography
│   ├── Spacing
│   └── Effects (shadows, glows)
│
├── 📦 Components
│   ├── Primitives (existing)
│   │   ├── btn-primary
│   │   ├── btn-secondary
│   │   ├── input-text
│   │   ├── badge-status
│   │   └── ...
│   │
│   └── Canvas (NEW)
│       ├── flow-card
│       ├── role-node
│       ├── connection-line
│       ├── role-detail-panel
│       ├── offer-card
│       ├── send-offer-modal
│       ├── offer-received-card
│       └── flow-summary-card
│
├── 📱 Screens
│   ├── my-flows-dashboard
│   ├── private-canvas
│   ├── send-offer-modal
│   └── offer-tracking
│
└── 🔄 Prototyping
    └── Flow: New Flow → Canvas → Send Offer → Track
```

---

## CODE GENERATION STRATEGY

### Option A: Figma → React via Anima/Locofy

1. Build components in Figma with Auto Layout
2. Use Anima or Locofy plugin to export React + Tailwind
3. Clean up generated code
4. Connect to API/state management

**Pros:** Fast, visual-first  
**Cons:** Generated code needs cleanup

### Option B: Figma → Design Tokens → Hand-code

1. Build components in Figma
2. Export design tokens (colors, typography, spacing)
3. Hand-code React components using tokens
4. Use Figma as reference, not source

**Pros:** Cleaner code, full control  
**Cons:** Slower

### Option C: Figma Dev Mode → CSS/React

1. Build components in Figma
2. Use Figma Dev Mode to inspect
3. Copy CSS/properties directly
4. Build React components with copied styles

**Pros:** Accurate, modern workflow  
**Cons:** Requires Figma paid plan

**Recommendation:** Option C if you have Figma paid, otherwise Option B.

---

## NEXT STEPS FOR WILL

1. **Create Figma file** with structure above
2. **Build primitives first** (if not already done)
3. **Build canvas components** in order:
   - flow-card (simplest)
   - role-node (core)
   - offer-card (reusable)
   - role-detail-panel
   - send-offer-modal
   - flow-summary-card
4. **Compose screens** using components
5. **Add prototyping** for demo flow
6. **Export/handoff** via Dev Mode or plugin

---

## REFERENCE FILES

Existing wireframes to match:
- `/mnt/project/flowryd-discover-wireframe.html` (design system source)
- `/mnt/project/flowryd-explorer-v2.html` (network viz patterns)

New spec:
- `FLOWRYD_PRIVATE_CANVAS_SPEC.md` (functional requirements)

---

*This handoff is designed for maximum automation. Build components as variants, use Auto Layout, and the code generation will be cleaner.*
