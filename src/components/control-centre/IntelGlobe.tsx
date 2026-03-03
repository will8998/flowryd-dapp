'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { participants, type Participant } from '@/lib/canton-data';
import { 
  type IntelEvent, type IntelPerson, type IntelAnnouncement, type CIPRecord,
  intelPeople, intelAnnouncements, cipRegistry,
  getOrgById
} from '@/lib/canton-intel-data';
import type { GlobeMethods, GlobeProps } from 'react-globe.gl';

/* ------------------------------------------------------------------ */
/* Textures                                                            */
/* ------------------------------------------------------------------ */
const EARTH_NIGHT = '//unpkg.com/three-globe/example/img/earth-night.jpg';
const EARTH_TOPO  = '//unpkg.com/three-globe/example/img/earth-topology.png';
const NIGHT_SKY   = '//unpkg.com/three-globe/example/img/night-sky.png';

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */
interface IntelGlobeProps {
  onSelectParticipant?: (participant: Participant) => void;
  selectedParticipantId?: string;
  events?: IntelEvent[];
  onSelectEvent?: (event: IntelEvent) => void;
  onSelectPerson?: (person: IntelPerson) => void;
  onSelectAnnouncement?: (announcement: IntelAnnouncement) => void;
}

interface GlobePoint {
  lat: number;
  lng: number;
  pointSize: number;
  pointAlt: number;
  pointColor: string;
  pointType: 'participant' | 'event' | 'person' | 'announcement' | 'cip';
  source: Participant | IntelEvent | IntelPerson | IntelAnnouncement | CIPRecord;
  tooltipHtml: string;
}

interface GlobeRing {
  lat: number;
  lng: number;
}

interface GlobeArc {
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  arcColor: string;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
function participantTooltip(p: Participant): string {
  const sv = p.superValidator
    ? '<div style="font-size:9px;color:#34d399;margin-top:3px;">● SUPER VALIDATOR</div>'
    : '';
  const nodes = p.validatorNodes
    ? `<div style="font-size:9px;color:rgba(255,255,255,0.45);">NODES: ${p.validatorNodes}</div>`
    : '';
  return `
    <div style="padding:8px 12px;font-family:ui-monospace,monospace;max-width:240px;line-height:1.4;">
      <div style="font-weight:700;font-size:12px;color:#fff;">${p.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.35);margin-bottom:3px;">${p.cantonRole}</div>
      ${sv}${nodes}
    </div>`;
}

function eventTooltip(e: IntelEvent): string {
  return `
    <div style="padding:8px 12px;font-family:ui-monospace,monospace;max-width:240px;line-height:1.4;">
      <div style="font-weight:700;font-size:12px;color:#fbbf24;">${e.name}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5);">${e.location}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;">${e.type.toUpperCase()}</div>
    </div>`;
}

function personTooltip(p: IntelPerson): string {
  const priority = p.priority === 'Critical' || p.priority === 'High'
    ? '<div style="font-size:9px;color:#f87171;margin-top:3px;">● HIGH PRIORITY</div>'
    : '';
  return `
    <div style="padding:8px 12px;font-family:ui-monospace,monospace;max-width:240px;line-height:1.4;">
      <div style="font-weight:700;font-size:12px;color:#22d3ee;">${p.fullName}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5);">${p.currentRole}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.3);margin-top:2px;">${p.organization}</div>
      ${priority}
    </div>`;
}

function announcementTooltip(a: IntelAnnouncement): string {
  const description = a.description.length > 80 ? a.description.slice(0, 80) + '...' : a.description;
  const impact = a.impact === 'Critical' || a.impact === 'High'
    ? '<div style="font-size:9px;color:#f87171;margin-top:3px;">● HIGH IMPACT</div>'
    : '';
  return `
    <div style="padding:8px 12px;font-family:ui-monospace,monospace;max-width:240px;line-height:1.4;">
      <div style="font-weight:700;font-size:12px;color:#a78bfa;">${a.type.toUpperCase()}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5);margin-bottom:3px;">${description}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.3);">${a.date}</div>
      ${impact}
    </div>`;
}

function cipTooltip(c: CIPRecord): string {
  return `
    <div style="padding:8px 12px;font-family:ui-monospace,monospace;max-width:240px;line-height:1.4;">
      <div style="font-weight:700;font-size:12px;color:#fb923c;">${c.cipNumber}</div>
      <div style="font-size:10px;color:rgba(255,255,255,0.5);">${c.title}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.35);margin-top:2px;">${c.proposer}</div>
      <div style="font-size:9px;color:rgba(255,255,255,0.3);">${c.status}</div>
    </div>`;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function IntelGlobe({
  onSelectParticipant,
  events = [],
  onSelectEvent,
  onSelectPerson,
  onSelectAnnouncement,
}: IntelGlobeProps) {
  /* ---- Dynamic import (SSR-safe) ---- */
  type GlobeFC = React.FunctionComponent<
    GlobeProps & { ref?: React.MutableRefObject<GlobeMethods | undefined> }
  >;
  const [GlobeComponent, setGlobeComponent] = useState<GlobeFC | null>(null);
  useEffect(() => {
    import('react-globe.gl').then(mod => {
      setGlobeComponent(() => mod.default as unknown as GlobeFC);
    });
  }, []);

  const globeRef = useRef<GlobeMethods | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [ready, setReady] = useState(false);
  const [cyclingRings, setCyclingRings] = useState<GlobeRing[]>([]);


  /* ---- Responsive sizing ---- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setDims({ w: Math.floor(width), h: Math.floor(height) });
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* ---- Auto-rotation + camera ---- */
  useEffect(() => {
    if (!ready || !globeRef.current) return;

    // Camera start position
    globeRef.current.pointOfView({ lat: 30, lng: 10, altitude: 2.2 }, 1500);

    // Orbit controls
    const controls = globeRef.current.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.35;
      controls.enableZoom = true;
      controls.minDistance = 120;
      controls.maxDistance = 600;
      controls.enableDamping = true;
      controls.dampingFactor = 0.1;
    }
  }, [ready]);

  /* ---- Data ---- */
  const validParticipants = useMemo(
    () => participants.filter(p => p.lat != null && p.lng != null),
    [participants],
  );

  const validEvents = useMemo(
    () => events.filter(e => e.lat != null && e.lng != null),
    [events],
  );

  /* ---- Cycling activity rings ---- */
  useEffect(() => {
    if (!ready || validParticipants.length === 0) return;

    const interval = setInterval(() => {
      // Pick 3 random participants for cycling rings
      const shuffled = [...validParticipants].sort(() => Math.random() - 0.5);
      const randomParticipants = shuffled.slice(0, 3);
      const newRings = randomParticipants.map(p => ({
        lat: p.lat!,
        lng: p.lng!,
      }));
      setCyclingRings(newRings);
    }, 2500);

    return () => clearInterval(interval);
  }, [ready, validParticipants]);

  /* Points (participants + events + people + announcements + cips) */
  const pointsData = useMemo<GlobePoint[]>(() => {
    const pts: GlobePoint[] = validParticipants.map(p => {
      const crit = p.criticality === 'CRITICAL';
      const req = p.criticality === 'REQUIRED';
      return {
        lat: p.lat!,
        lng: p.lng!,
        pointSize: crit ? 0.55 : req ? 0.38 : 0.25,
        pointAlt: crit ? 0.15 : req ? 0.10 : 0.06,
        pointColor: p.superValidator
          ? '#34d399'
          : crit ? '#f0fdf4' : req ? 'rgba(167,243,208,0.8)' : 'rgba(110,231,183,0.5)',
        pointType: 'participant' as const,
        source: p,
        tooltipHtml: participantTooltip(p),
      };
    });

    const evtPts: GlobePoint[] = validEvents.map(e => ({
      lat: e.lat!,
      lng: e.lng!,
      pointSize: 0.55,
      pointAlt: 0.1,
      pointColor: '#fbbf24',
      pointType: 'event' as const,
      source: e,
      tooltipHtml: eventTooltip(e),
    }));

    // People points — derive location from their organization
    const peoplePts: GlobePoint[] = intelPeople
      .map(person => {
        const org = getOrgById(person.organizationId);
        if (!org?.lat || !org?.lng) return null;
        // Offset slightly so they don't overlap the org dot
        const offset = 0.5 + (Math.random() * 0.5);
        return {
          lat: org.lat + offset,
          lng: org.lng + offset,
          pointSize: 0.20,
          pointAlt: 0.04,
          pointColor: '#22d3ee', // cyan-400
          pointType: 'person' as const,
          source: person,
          tooltipHtml: personTooltip(person),
        };
      })
      .filter(Boolean) as GlobePoint[];

    const announcementPts: GlobePoint[] = intelAnnouncements
      .map(ann => {
        // Find first participant org with coordinates
        const orgName = ann.participants[0];
        if (!orgName) return null;
        const org = participants.find(p => p.name.toLowerCase().includes(orgName.toLowerCase().split(' ')[0]));
        if (!org?.lat || !org?.lng) return null;
        return {
          lat: org.lat - 0.8,
          lng: org.lng + 0.8,
          pointSize: 0.22,
          pointAlt: 0.05,
          pointColor: '#a78bfa', // violet-400
          pointType: 'announcement' as const,
          source: ann,
          tooltipHtml: announcementTooltip(ann),
        };
      })
      .filter(Boolean) as GlobePoint[];

    const cipPts: GlobePoint[] = cipRegistry
      .map(cip => {
        const org = participants.find(p => p.name.toLowerCase().includes(cip.proposer.toLowerCase().split(' ')[0]));
        if (!org?.lat || !org?.lng) return null;
        return {
          lat: org.lat + 0.3,
          lng: org.lng - 0.6,
          pointSize: 0.18,
          pointAlt: 0.03,
          pointColor: '#fb923c', // orange-400
          pointType: 'cip' as const,
          source: cip,
          tooltipHtml: cipTooltip(cip),
        };
      })
      .filter(Boolean) as GlobePoint[];

    return [...pts, ...evtPts, ...peoplePts, ...announcementPts, ...cipPts];
  }, [validParticipants, validEvents, intelPeople, intelAnnouncements, cipRegistry]);
  /* Rings (pulsing event markers) */
  const ringsData = useMemo<GlobeRing[]>(() => {
    const eventRings = validEvents.map(e => ({ lat: e.lat!, lng: e.lng! }));
    // Merge event rings with cycling activity rings
    return [...eventRings, ...cyclingRings];
  }, [validEvents, cyclingRings]);

  /* Arcs (network connections from events → critical nodes) */
  const arcsData = useMemo<GlobeArc[]>(() => {
    const critical = validParticipants
      .filter(p => p.criticality === 'CRITICAL')
      .sort((a, b) => a.name.localeCompare(b.name));

    const arcs: GlobeArc[] = [];
    validEvents.forEach(event => {
      // Deterministic pick: first 12 critical participants
      critical.slice(0, 12).forEach(p => {
        arcs.push({
          startLat: event.lat!,
          startLng: event.lng!,
          endLat: p.lat!,
          endLng: p.lng!,
          arcColor: 'rgba(251,191,36,0.15)',
        });
      });
    });

    // Also connect some super-validators to each other for network feel
    const svs = validParticipants.filter(p => p.superValidator);
    for (let i = 0; i < svs.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, svs.length); j++) {
        arcs.push({
          startLat: svs[i].lat!,
          startLng: svs[i].lng!,
          endLat: svs[j].lat!,
          endLng: svs[j].lng!,
          arcColor: 'rgba(52,211,153,0.12)',
        });
      }
    }

    return arcs;
  }, [validParticipants, validEvents]);

  /* ---- Handlers ---- */
  const handlePointClick = useCallback(
    (point: object) => {
      const d = point as GlobePoint;
      // Click-to-zoom: Move camera to point location
      globeRef.current?.pointOfView({ lat: d.lat, lng: d.lng, altitude: 1.2 }, 800);
      
      if (d.pointType === 'participant') {
        onSelectParticipant?.(d.source as Participant);
      } else if (d.pointType === 'event') {
        onSelectEvent?.(d.source as IntelEvent);
      } else if (d.pointType === 'person') {
        onSelectPerson?.(d.source as IntelPerson);
      } else if (d.pointType === 'announcement') {
        onSelectAnnouncement?.(d.source as IntelAnnouncement);
      }
      // CIP clicks — no dedicated handler, could zoom only
    },
    [onSelectParticipant, onSelectEvent, onSelectPerson, onSelectAnnouncement],
  );
  const handleResetView = useCallback(() => {
    globeRef.current?.pointOfView({ lat: 30, lng: 10, altitude: 2.2 }, 800);
  }, []);

  const handleGlobeReady = useCallback(() => setReady(true), []);

  /* ---- Render ---- */
  if (!GlobeComponent) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center" style={{ background: '#09090b' }}>
        <div className="text-white/20 text-xs font-mono animate-pulse">INITIALIZING GLOBE…</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative" style={{ background: '#09090b' }}>
      {dims.w > 0 && dims.h > 0 && (
        <GlobeComponent
          ref={globeRef}
          width={dims.w}
          height={dims.h}

          /* ── Globe appearance ── */
          globeImageUrl={EARTH_NIGHT}
          bumpImageUrl={EARTH_TOPO}
          backgroundImageUrl={NIGHT_SKY}
          backgroundColor="rgba(0,0,0,0)"
          showAtmosphere={true}
          atmosphereColor="#10b981"
          atmosphereAltitude={0.25}
          animateIn={true}

          /* ── Points (participants + events) ── */
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointRadius="pointSize"
          pointAltitude="pointAlt"
          pointColor="pointColor"
          pointLabel="tooltipHtml"
          pointResolution={12}
          pointsMerge={false}
          pointsTransitionDuration={800}
          onPointClick={handlePointClick}

          /* ── Rings (event pulse) ── */
          ringsData={ringsData}
          ringLat="lat"
          ringLng="lng"
          ringColor={() => ['rgba(251,191,36,0.6)', 'rgba(251,191,36,0)']}
          ringMaxRadius={4}
          ringPropagationSpeed={3}
          ringRepeatPeriod={1200}

          /* ── Arcs (network connections) ── */
          arcsData={arcsData}
          arcStartLat="startLat"
          arcStartLng="startLng"
          arcEndLat="endLat"
          arcEndLng="endLng"
          arcColor="arcColor"
          arcDashLength={0.4}
          arcDashGap={0.25}
          arcDashAnimateTime={4000}
          arcStroke={0.5}
          arcsTransitionDuration={500}

          /* ── Interaction ── */
          enablePointerInteraction={true}
          onGlobeReady={handleGlobeReady}
        />
      )}

      {/* HUD Overlay */}
      <div className="absolute inset-0 pointer-events-none font-mono text-white">
        {/* Top-left: CANTON NETWORK label and stats */}
        <div className="absolute top-4 left-4">
          <div className="text-[10px] tracking-wider text-white font-bold">CANTON NETWORK</div>
          <div className="text-[8px] text-white/40 mt-0.5">GLOBAL INTELLIGENCE</div>
          <div className="text-[8px] text-white/60 mt-1">{validParticipants.length} NODES • {intelPeople.length} PEOPLE • {intelAnnouncements.length} ALERTS • LIVE</div>
        </div>

        {/* Top-right: Reset View button */}
        <div className="absolute top-4 right-4">
          <button
            onClick={handleResetView}
            className="pointer-events-auto px-2 py-1 text-[8px] bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white/80 hover:text-white transition-colors"
          >
            Reset View
          </button>
        </div>

        {/* Bottom-left: Color legend */}
        <div className="absolute bottom-4 left-4">
          <div className="text-[8px] text-white/60 mb-2">NODE TYPES</div>
          <div className="space-y-0.5 text-[7px]">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
              <span className="text-white/60">Super Validator</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
              <span className="text-white/60">Critical</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-200"></div>
              <span className="text-white/60">Required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300"></div>
              <span className="text-white/60">Standard</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
              <span className="text-white/60">Event</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
              <span className="text-white/60">People</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-violet-400"></div>
              <span className="text-white/60">Announcements</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
              <span className="text-white/60">CIP Proposals</span>
            </div>
        </div>
      </div>
      </div>

      {/* Gradient vignette overlay for visual polish */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(9,9,11,0.6) 100%)',
        }}
      />
    </div>
  );
}
