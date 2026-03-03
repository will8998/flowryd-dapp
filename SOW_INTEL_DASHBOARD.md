# Flowryd SOW — Canton Intelligence Dashboard

> **Version**: 1.0
> **Date**: February 26, 2026
> **Status**: Planning
> **For**: Any agent continuing this work
> **Relates to**: `ARCHITECTURE.md`, `M3_ROADMAP.md`, `SOW_EXECUTION_PLAN.md`

---

## Overview

Build a full-page **Canton Intelligence Dashboard** inside Flowryd's Control Centre. The dashboard provides a dark interactive world map showing Canton Network participant locations and a live news feed filtered to Canton Network coverage. Inspired by [WorldMonitor.app](https://worldmonitor.app)'s visual style but built from scratch (WorldMonitor is AGPL — incompatible with commercial SaaS).

### User Value

- **Institutional credibility** — Shows Flowryd as a serious Canton ecosystem hub, not just a flow builder
- **Real-time awareness** — Canton Network news aggregated in one place (cross-border repo, tokenized Gilts, new participants)
- **Participant discovery** — Visual geographic view of the 80+ Canton participants, clickable for detail

### Design Direction

- Full-page dark map (CartoDB Dark Matter tiles) with glowing cyan/green participant markers
- Right-side overlay panel for live Canton news feed
- Matches existing Flowryd dark theme (zinc-900/950 backgrounds, cyan/emerald accents)
- Smooth animations consistent with existing Framer Motion usage

---

## Quick Start for Agents

**READ THESE FIRST:**
1. `ARCHITECTURE.md` — System architecture, tech stack, conventions
2. `src/components/control-centre/FlowsStudio.tsx` — View switcher (you'll add INTEL tier here)
3. `src/components/control-centre/StudioSidebar.tsx` — Sidebar navigation (you'll modify Intelligence item here)
4. `src/lib/canton-data.ts` — Participant data (you'll add lat/lng coordinates here)

**Stack decisions (already made):**
- Map: `react-map-gl` + `maplibre-gl` (MIT, ~250KB, free tiles)
- Tiles: CartoDB Dark Matter — `https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png`
- News: Server-side aggregation via CryptoPanic API + RSS fallback
- No new database tables — news fetched live, participant coords in static data

---

## Decisions Required Before Implementation

| # | Decision | Recommendation | Impact |
|---|----------|---------------|--------|
| 1 | Sidebar icon for Intelligence | `Radar` from lucide-react | Visual only |
| 2 | News panel position | Right-side overlay on map | Layout |
| 3 | CryptoPanic API key | Free tier available (5 req/min) | Need key in `.env.local` |
| 4 | Commit strategy | One commit per wave | Git history |

> **Action**: Confirm these or override before starting Wave 1.

---

## Task Dependency Graph

```
WAVE 1: [ID01] [ID02] [ID03] [ID04] — All parallel, no deps
         │       │       │       │
WAVE 2: [ID05] ─────── [ID06] ───── Depend on Wave 1
         │               │
WAVE 3: [ID07] ──────────────────── Depends on ID05 + ID06
         │
WAVE 4: [ID08] ──────────────────── Depends on ID07 (polish + QA)
```

**Estimated total effort**: 3–5 days (one developer)
**Total new files**: 4
**Total modified files**: 3

---

## WAVE 1: Foundation — Packages, Data, Navigation, API

All four tasks are independent and can run in parallel.

---

### ID01 — Install Map Packages
**Complexity**: S | **Category**: `quick` | **Skills**: none

**What to do**:
1. Install production packages:
```bash
npm install maplibre-gl react-map-gl
```
2. Verify `next build` still passes — MapLibre requires dynamic import (no SSR)

**Files modified**: `package.json`, `package-lock.json`

**Acceptance**: Packages in `package.json`. `npm run build` passes. No new lint errors.

---

### ID02 — Add Lat/Lng to Canton Participant Data
**Complexity**: M | **Category**: `quick` | **Skills**: none

**What to do**:
1. Open `src/lib/canton-data.ts`
2. Add `lat` and `lng` optional fields to the `Participant` interface:
```typescript
interface Participant {
  // ...existing fields
  lat?: number;
  lng?: number;
}
```
3. Add real-world headquarters coordinates to all 82 participants in the `PARTICIPANTS` array. Use known HQ locations:
   - Goldman Sachs → 40.7146, -74.0071 (NYC)
   - Deutsche Börse → 50.1109, 8.6821 (Frankfurt)
   - SIX → 47.3769, 8.5417 (Zurich)
   - etc.
4. For participants without a known HQ, assign coordinates based on their known region or omit lat/lng (they won't appear on the map)

**Files modified**: `src/lib/canton-data.ts`

**Acceptance**: All participants with known locations have lat/lng. TypeScript compiles. No duplicate coordinates at exact same point (offset slightly if co-located).

---

### ID03 — Wire INTEL Tier into Navigation
**Complexity**: M | **Category**: `quick` | **Skills**: none

**What to do**:

1. **`src/components/control-centre/FlowsStudio.tsx`**:
   - Add `'INTEL'` to the `Tier` type:
     ```typescript
     type Tier = 'DISCOVER' | 'NAVIGATE' | 'ACTIVATE' | 'JOIN' | 'ADMIN' | 'INTEL';
     ```
   - Add a case in the `AnimatePresence` render switch for `INTEL`:
     ```tsx
     {activeTier === 'INTEL' && (
       <motion.div key="intel" /* same animation pattern as other tiers */>
         <IntelligenceDashboard />
       </motion.div>
     )}
     ```
   - Import `IntelligenceDashboard` dynamically (since it uses MapLibre which can't SSR):
     ```typescript
     import dynamic from 'next/dynamic';
     const IntelligenceDashboard = dynamic(
       () => import('./IntelligenceDashboard'),
       { ssr: false, loading: () => <div className="w-full h-full bg-zinc-950" /> }
     );
     ```

2. **`src/components/control-centre/StudioSidebar.tsx`**:
   - Change the "Intelligence" secondary menu item from dispatching `toggle-ryd-ai` to navigating to `tier: 'INTEL'`:
     ```typescript
     // BEFORE:
     { label: 'Intelligence', icon: Terminal, action: () => dispatch('toggle-ryd-ai') }
     // AFTER:
     { label: 'Intelligence', icon: Radar, tier: 'INTEL' as Tier }
     ```
   - Import `Radar` from `lucide-react` (replace `Terminal` if no longer used)
   - Ensure the click handler sets `activeTier` to `'INTEL'` using the same pattern as other tier items

**Files modified**: `src/components/control-centre/FlowsStudio.tsx`, `src/components/control-centre/StudioSidebar.tsx`

**Acceptance**: Clicking "Intelligence" in sidebar renders the IntelligenceDashboard placeholder. No TypeScript errors. Sidebar highlights correctly. Back navigation works.

---

### ID04 — Build News Aggregation API Route
**Complexity**: M | **Category**: `deep` | **Skills**: none

**What to do**:

1. Create `src/app/api/intel/news/route.ts`:
```typescript
// GET /api/intel/news?limit=20&offset=0
// Returns aggregated Canton Network news from CryptoPanic + RSS fallback

import { NextRequest, NextResponse } from 'next/server';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;       // ISO 8601
  summary?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

interface NewsResponse {
  items: NewsItem[];
  total: number;
  fetchedAt: string;
}
```

2. **CryptoPanic integration** (primary source):
   - Endpoint: `https://cryptopanic.com/api/v1/posts/?auth_token={CRYPTOPANIC_API_KEY}&currencies=canton&kind=news&public=true`
   - Also try filter: `&filter=important` for high-signal items
   - Search keywords if `currencies` filter insufficient: `canton+network`, `digital+asset+canton`, `daml+ledger`
   - Rate limit: 5 requests/minute on free tier
   - Parse response into `NewsItem[]`

3. **RSS fallback** (secondary sources — fetch if CryptoPanic fails or returns < 5 items):
   - `https://www.canton.network/blog/rss` (if exists)
   - `https://www.digitalasset.com/blog/rss.xml` (if exists)
   - Use built-in `fetch` + basic XML parsing (DOMParser or a lightweight XML parser)
   - Deduplicate by URL

4. **Caching**:
   - Use in-memory cache with 5-minute TTL (global variable, survives within serverless cold start window)
   - Return cached data if within TTL
   - Set `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` header

5. **Error handling**:
   - If CryptoPanic key is missing → fallback to RSS only, log warning
   - If all sources fail → return empty array with `fetchedAt` timestamp
   - Never throw — always return valid JSON

6. Add `CRYPTOPANIC_API_KEY` to `.env.example`:
```
# Canton Intelligence Dashboard (optional — RSS fallback if missing)
CRYPTOPANIC_API_KEY=
```

**Files created**: `src/app/api/intel/news/route.ts`
**Files modified**: `.env.example`

**Acceptance**: `curl http://localhost:3000/api/intel/news` returns valid JSON. Works without API key (RSS fallback). Response includes `Cache-Control` header. No TypeScript errors.

---

## WAVE 2: Core Components — Map + News Feed

Depends on Wave 1. Both tasks can run in parallel.

---

### ID05 — Build IntelMap Component
**Complexity**: L | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`

**What to do**:

1. Create `src/components/control-centre/IntelMap.tsx`

2. **Map setup**:
   - Use `react-map-gl` with `maplibre-gl` as the map library
   - Initial view: centered on Atlantic (lat: 30, lng: 0, zoom: 2)
   - Style: CartoDB Dark Matter tiles
   ```tsx
   <Map
     mapLib={import('maplibre-gl')}
     mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
     initialViewState={{ latitude: 30, longitude: 0, zoom: 2 }}
   />
   ```

3. **Participant markers**:
   - Import participants from `src/lib/canton-data.ts`
   - Filter to only those with `lat` and `lng` defined
   - Render as `<Marker>` components with custom styling:
     - Outer ring: `border-cyan-400/50` with subtle pulse animation (CSS keyframes)
     - Inner dot: solid `bg-cyan-400` (or `bg-emerald-400` for super validators)
     - Size: 12px default, 16px for `criticality: 'CRITICAL'`
   - On hover: Show tooltip with participant name, role, and capabilities summary
   - On click: Open a detail popup (Popup component from react-map-gl) with:
     - Name, logo (if available), canton role
     - Capabilities as small badges
     - Validator nodes count (if applicable)
     - Link to their profile in the Discover tier

4. **Visual polish**:
   - Smooth fly-to animation when clicking a marker
   - Cluster markers when zoomed out (if 3+ markers overlap) — show count badge
   - Dark map controls (zoom +/- buttons) styled to match Flowryd theme
   - No map attribution link (CartoDB free tier allows this)
   - Fill entire parent container (`w-full h-full`)

5. **Performance**:
   - Memoize marker rendering with `useMemo`
   - Lazy-load maplibre-gl (it's ~250KB)
   - Don't re-render markers on viewport changes (only on data changes)

**Files created**: `src/components/control-centre/IntelMap.tsx`

**Acceptance**: Map renders with dark tiles. All participants with coordinates show as markers. Hover shows tooltip. Click shows popup. Smooth animations. No console errors. Responsive layout.

---

### ID06 — Build IntelNewsFeed Component
**Complexity**: M | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`

**What to do**:

1. Create `src/components/control-centre/IntelNewsFeed.tsx`

2. **Data fetching**:
   - Fetch from `/api/intel/news?limit=20` using `useEffect` + `fetch`
   - Auto-refresh every 5 minutes
   - Show loading skeleton while fetching (3-4 placeholder cards with pulse animation)
   - Show error state if fetch fails ("Unable to load news — retrying...")

3. **Layout**:
   - Vertical scrollable panel, dark background (`bg-zinc-950/90 backdrop-blur-sm`)
   - Fixed header: "CANTON NETWORK INTEL" with a small live indicator dot (pulsing green)
   - Each news item as a card:
     ```
     ┌────────────────────────────────┐
     │ Source • 2 hours ago           │
     │ Title of the news article that │
     │ can wrap to two lines maximum  │
     │ Brief summary if available...  │
     └────────────────────────────────┘
     ```
   - Cards have subtle border (`border-zinc-800`), hover state (`border-zinc-700`)
   - Click opens article URL in new tab
   - Sentiment indicator (optional): small colored dot — green/red/gray

4. **Styling**:
   - Text: `text-zinc-300` for titles, `text-zinc-500` for meta
   - Source labels: small monospace badges (`text-xs font-mono`)
   - Relative timestamps: "2h ago", "1d ago" (compute client-side)
   - Scrollbar: thin, dark, or hidden with overflow-y-auto
   - Max visible items before scroll: ~6-8 depending on viewport

5. **Empty state**: If no news items, show "No Canton Network news found. Monitoring sources..." with a subtle radar animation

**Files created**: `src/components/control-centre/IntelNewsFeed.tsx`

**Acceptance**: News feed renders with real or fallback data. Loading skeleton shows on initial load. Auto-refresh works. Cards are clickable. Scrollable. Dark theme consistent with Flowryd.

---

## WAVE 3: Composition — Dashboard Layout

Depends on ID05 + ID06.

---

### ID07 — Build IntelligenceDashboard Layout
**Complexity**: M | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`

**What to do**:

1. Create `src/components/control-centre/IntelligenceDashboard.tsx`

2. **Layout**:
   ```
   ┌─────────────────────────────────────────────────┐
   │                                    ┌────────────┤
   │                                    │  NEWS FEED │
   │           INTEL MAP                │            │
   │         (full bleed)               │  Card 1    │
   │                                    │  Card 2    │
   │                                    │  Card 3    │
   │                                    │  ...       │
   │                                    └────────────┤
   │  [Stats bar: 82 participants • 12 validators]   │
   └─────────────────────────────────────────────────┘
   ```
   - Map takes full width/height of the container
   - News feed overlays on right side: `w-80` (320px), `absolute right-0 top-0 bottom-0`
   - News feed panel has toggle button (chevron) to collapse/expand
   - Bottom stats bar: participant count, validator count, super-validator count, last news update time

3. **Component composition**:
   ```tsx
   export default function IntelligenceDashboard() {
     const [showNews, setShowNews] = useState(true);
     return (
       <div className="relative w-full h-full">
         <IntelMap />
         <AnimatePresence>
           {showNews && (
             <motion.div className="absolute right-0 top-0 bottom-0 w-80"
               initial={{ x: 320 }} animate={{ x: 0 }} exit={{ x: 320 }}>
               <IntelNewsFeed />
             </motion.div>
           )}
         </AnimatePresence>
         <StatsBar />
         <ToggleButton onClick={() => setShowNews(!showNews)} />
       </div>
     );
   }
   ```

4. **Stats bar**:
   - Fixed to bottom of map area
   - Semi-transparent dark background
   - Shows: `82 Participants • 14 Validators • 3 Super Validators • Updated 2m ago`
   - Small, unobtrusive — `text-xs text-zinc-500`

5. **Responsive behavior**:
   - Desktop (>1024px): Map + news panel side by side
   - Tablet (768-1024px): News panel collapsed by default, toggle to overlay
   - Mobile (<768px): Full map with bottom sheet for news (pull up)

**Files created**: `src/components/control-centre/IntelligenceDashboard.tsx`

**Acceptance**: Dashboard renders with map filling the view and news overlay on right. Toggle shows/hides news panel with animation. Stats bar shows correct counts. Responsive at all breakpoints. No layout shifts.

---

## WAVE 4: Polish & QA

Depends on ID07.

---

### ID08 — Visual Polish, Error Handling, and QA
**Complexity**: M | **Category**: `visual-engineering` | **Skills**: `frontend-ui-ux`, `playwright`

**What to do**:

1. **Visual polish**:
   - Entry animation: Map fades in with a subtle zoom from 1.5 → 2 (initial viewport animation)
   - Markers appear with staggered fade-in (50ms delay between each)
   - News panel slides in from right on first load
   - Ensure all animations use `prefers-reduced-motion` media query fallback

2. **Error handling**:
   - Map tile load failure → Show fallback dark background with "Map unavailable" message
   - News API failure → Show cached data with "Last updated X ago" + retry button
   - No participants with coordinates → Show empty map with "No participant locations available" message

3. **Accessibility**:
   - Map markers have `aria-label` with participant name
   - News cards have proper `<article>` semantics
   - Toggle button has `aria-expanded` state
   - Keyboard navigation: Tab through markers, Enter to open popup

4. **Performance audit**:
   - Verify MapLibre is lazy-loaded (check bundle with `npm run build`)
   - Verify no unnecessary re-renders (React DevTools profiler)
   - News feed pagination: Load 20, scroll to load more (if > 20 items)
   - Image optimization: Participant logos through Next.js Image if used

5. **QA checklist**:
   - [ ] Map renders on Chrome, Firefox, Safari
   - [ ] News feed populates with real or fallback data
   - [ ] Sidebar navigation to/from INTEL works
   - [ ] News panel toggle animates smoothly
   - [ ] No console errors or warnings
   - [ ] `npm run build` passes
   - [ ] `npx tsc --noEmit` passes
   - [ ] Mobile responsive layout works
   - [ ] Stats bar numbers are correct
   - [ ] MapLibre not in SSR bundle (dynamic import working)

**Files modified**: All Intel dashboard files from previous waves

**Acceptance**: All QA checklist items pass. No TypeScript errors. No console errors. Build succeeds. Responsive at all breakpoints.

---

## Summary Table

| ID | Task | Complexity | Wave | Category | Skills | New Files | Modified Files |
|----|------|-----------|------|----------|--------|-----------|---------------|
| ID01 | Install map packages | S | 1 | `quick` | — | — | `package.json` |
| ID02 | Add lat/lng to participants | M | 1 | `quick` | — | — | `canton-data.ts` |
| ID03 | Wire INTEL tier + sidebar | M | 1 | `quick` | — | — | `FlowsStudio.tsx`, `StudioSidebar.tsx` |
| ID04 | News aggregation API | M | 1 | `deep` | — | `api/intel/news/route.ts` | `.env.example` |
| ID05 | IntelMap component | L | 2 | `visual-engineering` | `frontend-ui-ux` | `IntelMap.tsx` | — |
| ID06 | IntelNewsFeed component | M | 2 | `visual-engineering` | `frontend-ui-ux` | `IntelNewsFeed.tsx` | — |
| ID07 | IntelligenceDashboard layout | M | 3 | `visual-engineering` | `frontend-ui-ux` | `IntelligenceDashboard.tsx` | — |
| ID08 | Polish + QA | M | 4 | `visual-engineering` | `frontend-ui-ux`, `playwright` | — | All Intel files |

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| CartoDB free tier (75k views/mo) exceeded | Low (internal tool) | Map tiles stop loading | Switch to self-hosted OpenMapTiles or MapTiler free tier |
| CryptoPanic API has no Canton content | Medium | Empty news feed | RSS fallback + manual keyword search (`canton`, `daml`, `digital asset`) |
| CryptoPanic API key not provided | Low | No primary news source | RSS-only mode works without key |
| MapLibre bundle too large | Low | Slow initial load | Dynamic import already planned; code-split is automatic |
| Canton participant HQ data inaccurate | Medium | Markers in wrong locations | Use well-known HQ addresses; allow manual corrections later |
| No Canton-specific news on a given day | Medium | Empty feed looks broken | Show "monitoring" state; broaden to DLT/tokenization news as fallback |

---

## Future Enhancements (Out of Scope)

These are **not** part of this SOW but are natural extensions:

1. **Live participant status** — Ping Canton nodes for online/offline status, show as marker color
2. **Deal flow visualization** — Animate lines between participants when deals are active
3. **Search & filter** — Filter map by canton role, criticality, or capabilities
4. **Custom news sources** — Admin-configurable RSS feeds
5. **Notification integration** — Push important Canton news to deal rooms
6. **Participant self-registration** — Companies update their own coordinates and profile
7. **Heat map mode** — Overlay showing deal activity density by region

---

## Relationship to M3 Roadmap

This dashboard is a **standalone M2 deliverable** that enhances the current platform without depending on Canton ledger integration. However, it **pre-wires** for M3:

- Participant coordinates stored in `canton-data.ts` today will migrate to the `participants` DB table with lat/lng columns when M3 adds self-service onboarding
- The news API architecture (server-side aggregation) can later incorporate Canton ledger event feeds
- Map markers can show live validator status once `LiveCantonService` replaces `MockCantonService`

**No M3 dependencies. No M3 conflicts. Ships independently.**
