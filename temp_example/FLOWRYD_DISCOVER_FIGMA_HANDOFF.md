# Figma Handoff: Discover Landing Page
## MVP Components for Will

**Purpose:** DISCOVER tier landing experience - convert visitors to $100/month subscribers  
**Key Insight:** Capture referral clicks ON-CHAIN before they even subscribe  
**Design System:** Matches existing flowryd tokens

---

## MVP SCOPE (Tightest)

### What Discover MUST Do:

1. **Show Network Position** - "Who am I connected to?"
2. **Behind the Flows Content** - News-driven workflow examples
3. **Referral Logos + Clicks** - Capture attribution ON-CHAIN
4. **VP Badges** - Trust signals (C7 verified parties)
5. **Convert to Subscribe** - CC payment gateway

### The Referral Capture Model:

```
User sees "Behind the Flows" story
    ↓
Story features logos: [7RIDGE] [Kaiko] [C7 Trust] [BitGo]
    ↓
User clicks logo → ON-CHAIN event captured
    ↓
Attribution recorded: "User X discovered Party Y via Flow Z"
    ↓
If User X later transacts with Party Y → 5% referral to Flowryd
```

**This is the business model for DISCOVER tier - you're monetizing discovery itself.**

---

## DESIGN TOKENS (Same as Canvas)

```javascript
colors: {
  'fr-bg': '#09090b',
  'fr-card': '#18181b',
  'fr-border': '#27272a',
  'fr-accent': '#3b82f6',
  'fr-success': '#22c55e',
  'fr-warning': '#eab308',
  'fr-purple': '#8b5cf6',
  'fr-cyan': '#06b6d4',
  'fr-muted': '#a1a1aa',
  'fr-dim': '#71717a',
  'fr-c7': '#6366f1'
}
```

---

## NEW COMPONENTS FOR DISCOVER

### 1. HeroSection

**Figma Name:** `discover/hero-section`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│                    DECODE YOUR NETWORK ADVANTAGE                    │
│                                                                     │
│     See who you're connected to, what workflows you can join,       │
│              and where the opportunities are hiding.                │
│                                                                     │
│     ┌─────────────────┐    ┌─────────────────┐                     │
│     │  Enter Party-ID │    │   Subscribe     │                     │
│     │   [__________]  │    │   $100/month    │                     │
│     │   [Explore →]   │    │   [Pay in CC →] │                     │
│     └─────────────────┘    └─────────────────┘                     │
│                                                                     │
│                    Already subscribed? [Sign In]                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface HeroSectionProps {
  onExplore: (partyId: string) => void;
  onSubscribe: () => void;
  onSignIn: () => void;
}
```

---

### 2. BehindTheFlowsCard

**Figma Name:** `discover/behind-flows-card`  
**Critical:** This is your content + referral capture engine

```
┌─────────────────────────────────────────────────────────────────────┐
│ 📰 BEHIND THE FLOWS                                    Jan 28, 2026 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  "Franklin Templeton's $400M Tokenized Money Market Fund"           │
│   How they built the infrastructure stack                           │
│                                                                     │
│  THE FLOW:                                                          │
│  ┌──────┐ → ┌──────┐ → ┌──────┐ → ┌──────┐ → ┌──────┐             │
│  │Issuer│   │Custdy│   │Oracle│   │Compli│   │Trans │             │
│  │ FT   │   │ BNY  │   │Kaiko │   │ C7   │   │Agent │             │
│  └──────┘   └──────┘   └──────┘   └──────┘   └──────┘             │
│     ↑           ↑          ↑          ↑          ↑                 │
│  [CLICK]     [CLICK]    [CLICK]    [CLICK]    [CLICK]              │
│  captured    captured   captured   captured   captured             │
│  on-chain    on-chain   on-chain   on-chain   on-chain             │
│                                                                     │
│  Template: Tokenized Fund Distribution                              │
│                                                                     │
│  [View Full Flow →]                    [Build Similar Flow →]       │
└─────────────────────────────────────────────────────────────────────┘
```

**Props:**
```typescript
interface BehindTheFlowsCardProps {
  id: string;
  headline: string;
  subheadline: string;
  newsSource?: string;
  newsDate?: Date;
  flowParticipants: FlowParticipant[];
  templateName: string;
  onParticipantClick: (participantId: string) => void; // ON-CHAIN CAPTURE
  onViewFlow: () => void;
  onBuildSimilar: () => void;
}

interface FlowParticipant {
  id: string;
  name: string;
  role: string;
  logo?: string;
  initials: string;
  isVP: boolean;
  gradientFrom: string;
  gradientTo: string;
}
```

---

### 3. ParticipantLogo (Clickable + Tracked)

**Figma Name:** `discover/participant-logo`  
**KEY COMPONENT:** Every click = on-chain event = future revenue

```
Default:                    Clicked:
┌────────────────┐         ┌────────────────┐
│    [LOGO]      │         │    [LOGO]  ✓   │
│                │   →     │   DISCOVERED   │
│    Kaiko       │         │    Kaiko       │
│  Price Oracle  │         │  Price Oracle  │
│    [VP ✓]      │         │    [VP ✓]      │
└────────────────┘         └────────────────┘
```

**Props:**
```typescript
interface ParticipantLogoProps {
  participantId: string;
  name: string;
  role: string;
  logoUrl?: string;
  initials: string;
  isVP: boolean;
  gradientFrom: string;
  gradientTo: string;
  onClick: () => void;
  isDiscovered: boolean;
  interestCount?: number; // "47 others interested"
}
```

**States:**
- Default (clickable)
- Hover (scale 1.05, glow, show "Click to discover")
- Discovered (cyan border, checkmark, "Discovered" label)
- VP variant (C7 purple badge)

**On Click Behavior:**
1. Visual feedback (checkmark, color change)
2. Brief toast "Interest captured on-chain"
3. API call to create on-chain record
4. Update local state

---

### 4. NetworkGridPreview

**Figma Name:** `discover/network-grid-preview`

```
┌─────────────────────────────────────────────────────────────────────┐
│ YOUR NETWORK POSITION                                [View Full →]  │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│                      Network Visualization                          │
│                                                                     │
│           ┌─────┐      ┌─────┐      ┌─────┐                        │
│           │ 7R  │──────│ YOU │──────│ IEU │                        │
│           └─────┘   ╱  └─────┘  ╲   └─────┘                        │
│                   ╱       │       ╲                                 │
│           ┌─────┐     ┌─────┐     ┌─────┐                          │
│           │ C7  │     │ MM  │     │ KAI │                          │
│           └─────┘     └─────┘     └─────┘                          │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  Direct Connections    Extended Network    VP Verified              │
│        12                    47                 8                   │
│                                                                     │
│          [🔒 Subscribe to explore your full network]               │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 5. FlowTemplateCard

**Figma Name:** `discover/flow-template-card`

```
┌─────────────────────────────────────────────────────────────────────┐
│  [Icon]  ETF 24/7 Arbitrage                              [POPULAR] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Continuous trading across time zones with real-time               │
│  NAV calculations and instant settlement.                          │
│                                                                     │
│  ROLES         TIME TO ACTIVATE        ACTIVE FLOWS                │
│    6               18 days                  23                      │
│                                                                     │
│  KEY PARTICIPANTS:                                                  │
│  [Logo][Logo][Logo][Logo]  ← All clickable, tracked on-chain       │
│                                                                     │
│              [View Details]        [Start This Flow →]             │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 6. SubscribeCTA

**Figma Name:** `discover/subscribe-cta`

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                                                             │   │
│  │  [Flowryd Logo]            DISCOVER                        │   │
│  │                            $100 /month                      │   │
│  │                                                             │   │
│  │  ✓ Network grid builder                                    │   │
│  │  ✓ VP badges (C7 Identity)                                 │   │
│  │  ✓ Connection intelligence                                 │   │
│  │  ✓ Behind the Flows content                                │   │
│  │                                                             │   │
│  │           [Subscribe with Canton Coin →]                   │   │
│  │                                                             │   │
│  │  Public Launch Pricing until April 30, 2026                │   │
│  │                                                             │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 7. DiscoveryToast (Feedback)

**Figma Name:** `discover/discovery-toast`  
**Shows after logo click**

```
┌─────────────────────────────────────────────────────────────────────┐
│  ✓ Interest captured on-chain                                       │
│                                                                     │
│  You discovered Kaiko. We'll help you connect                      │
│  when you're ready to build flows together.                        │
│                                                                     │
│  [Upgrade to Navigate →]                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

### 8. InterestCounter

**Figma Name:** `discover/interest-counter`  
**Shows social proof**

```
┌─────────────────────────────────┐
│  47 others interested           │
└─────────────────────────────────┘
```

---

## SCREEN COMPOSITION

**Figma Frame:** `screens/discover-landing`  
**Size:** 1440 x 2400 (scrollable)

```
┌─────────────────────────────────────────────────────────────────────┐
│ [Header]  Flowryd    Discover | Navigate | Activate    [Subscribe] │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════│
│                         HERO SECTION                                │
│              DECODE YOUR NETWORK ADVANTAGE                          │
│                                                                     │
│         [Enter Party-ID]              [Subscribe $100/mo]          │
│ ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════│
│                       BEHIND THE FLOWS                              │
│                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│  │ Franklin $400M   │ │ DTCC Pilot       │ │ 24/7 ETF Trading │   │
│  │ Tokenized Fund   │ │ $1B Treasuries   │ │ State Street     │   │
│  │                  │ │                  │ │                  │   │
│  │ [Logo][Logo]...  │ │ [Logo][Logo]...  │ │ [Logo][Logo]...  │   │
│  │    ↑ CLICKABLE   │ │    ↑ CLICKABLE   │ │    ↑ CLICKABLE   │   │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘   │
│ ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════│
│                    NETWORK POSITION PREVIEW                         │
│                                                                     │
│                    [Network Visualization]                          │
│                                                                     │
│            12 Direct    47 Extended    8 VP Verified               │
│                                                                     │
│              [🔒 Subscribe to explore full network]                │
│ ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════│
│                       FLOW TEMPLATES                                │
│                                                                     │
│  ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐   │
│  │ ETF 24/7         │ │ Repo Finance     │ │ MMF Trading      │   │
│  │ Arbitrage        │ │                  │ │                  │   │
│  │ [Logos...]       │ │ [Logos...]       │ │ [Logos...]       │   │
│  └──────────────────┘ └──────────────────┘ └──────────────────┘   │
│ ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│ ═══════════════════════════════════════════════════════════════════│
│                         SUBSCRIBE CTA                               │
│                                                                     │
│                    DISCOVER - $100/month                           │
│                    [Subscribe with Canton Coin →]                  │
│                                                                     │
│              Public Launch Pricing until April 30, 2026            │
│ ═══════════════════════════════════════════════════════════════════│
│                                                                     │
│ [Footer]                                                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## ON-CHAIN CLICK CAPTURE

### Contract Structure

```daml
template DiscoveryClick
  with
    clickId : Text
    viewerSession : Text           -- Anonymous or Party-ID
    viewerParty : Optional Party   -- If logged in
    discoveredParty : Party        -- Who they clicked
    discoveredPartyName : Text
    context : DiscoveryContext
    timestamp : Time
    flowrydOperator : Party
  where
    signatory flowrydOperator
    observer discoveredParty
    
data DiscoveryContext = DiscoveryContext
  { source : Text          -- "behind_flows" | "template" | "grid"
  , contentId : Text       -- Specific story/template ID
  , role : Optional Text   -- Role in the flow
  }
```

### API Flow

```typescript
// On logo click
async function captureDiscovery(participantId: string, context: string) {
  const response = await fetch('/api/discover/capture', {
    method: 'POST',
    body: JSON.stringify({
      discoveredPartyId: participantId,
      context: context,
      sessionId: getSessionId(),
      timestamp: Date.now()
    })
  });
  
  // Creates on-chain record
  const { clickId, txHash } = await response.json();
  
  // Show toast
  showDiscoveryToast(participantId);
}
```

---

## CONTENT REQUIREMENTS

### Behind the Flows (3-5 Stories)

| Story | Headline | Participants | Template |
|-------|----------|--------------|----------|
| 1 | Franklin Templeton's $400M Tokenized Fund | Franklin, BNY, Kaiko, C7, Broadridge | Fund Distribution |
| 2 | DTCC Moves $1B in Tokenized Treasuries | DTCC, BNY, Goldman, JPM, Citi | Collateral Mobility |
| 3 | State Street Eyes 24/7 ETF Settlement | State Street, NYSE, BitGo, Chainlink | ETF Arbitrage |
| 4 | Circle's On-Chain Reserve Proof | Circle, BNY, Anchorage | Proof of Reserves |
| 5 | Apollo's $1B Tokenized Credit Fund | Apollo, Hamilton Lane, Figure | Private Credit |

### Flow Templates (3-5)

| Template | Roles | Avg Time | Active |
|----------|-------|----------|--------|
| ETF 24/7 Arbitrage | 6 | 18 days | 23 |
| Repo Financing | 5 | 14 days | 17 |
| MMF Distribution | 7 | 21 days | 31 |
| Collateral Mobility | 8 | 30 days | 12 |
| Proof of Reserves | 4 | 7 days | 9 |

---

## FIGMA FILE STRUCTURE

```
Flowryd Discover Landing
├── 📦 Components
│   └── discover/
│       ├── hero-section
│       ├── behind-flows-card
│       ├── participant-logo     ← KEY COMPONENT
│       ├── network-grid-preview
│       ├── flow-template-card
│       ├── subscribe-cta
│       ├── discovery-toast
│       └── interest-counter
│
├── 📱 Screens
│   └── discover-landing
│
└── 🔄 Prototyping
    └── Click Logo → Toast → Track state
```

---

## BUILD ORDER FOR WILL

1. **participant-logo** - Core component, reused everywhere
2. **behind-flows-card** - Main content driver
3. **hero-section** - Entry point
4. **subscribe-cta** - Conversion
5. **discovery-toast** - Feedback
6. **network-grid-preview** - Value teaser
7. **flow-template-card** - Secondary content

---

## SUCCESS METRICS

| Metric | Target | Why |
|--------|--------|-----|
| Logo clicks/visitor | >3 | Engagement depth |
| Unique logos clicked | >5 | Exploration breadth |
| Click → Subscribe | >5% | Conversion |
| Time on page | >90s | Content value |
| Return visits | >25% | Building habit |

---

*The key insight: every logo click is a monetizable event. DISCOVER isn't just a landing page—it's a lead qualification and attribution engine.*
