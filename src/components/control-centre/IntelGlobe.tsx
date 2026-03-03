'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { participants, type Participant } from '@/lib/canton-data';
import { type IntelEvent } from '@/lib/canton-intel-data';
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
}

interface GlobePoint {
  lat: number;
  lng: number;
  pointSize: number;
  pointAlt: number;
  pointColor: string;
  pointType: 'participant' | 'event';
  source: Participant | IntelEvent;
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

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function IntelGlobe({
  onSelectParticipant,
  events = [],
  onSelectEvent,
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
    [],
  );

  const validEvents = useMemo(
    () => events.filter(e => e.lat != null && e.lng != null),
    [events],
  );

  /* Points (participants + events) */
  const pointsData = useMemo<GlobePoint[]>(() => {
    const pts: GlobePoint[] = validParticipants.map(p => {
      const crit = p.criticality === 'CRITICAL';
      const req = p.criticality === 'REQUIRED';
      return {
        lat: p.lat!,
        lng: p.lng!,
        pointSize: crit ? 0.35 : req ? 0.22 : 0.14,
        pointAlt: crit ? 0.06 : req ? 0.03 : 0.015,
        pointColor: p.superValidator
          ? '#34d399'
          : crit ? '#ffffff' : req ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.3)',
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

    return [...pts, ...evtPts];
  }, [validParticipants, validEvents]);

  /* Rings (pulsing event markers) */
  const ringsData = useMemo<GlobeRing[]>(
    () => validEvents.map(e => ({ lat: e.lat!, lng: e.lng! })),
    [validEvents],
  );

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
          arcColor: 'rgba(251,191,36,0.08)',
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
          arcColor: 'rgba(52,211,153,0.06)',
        });
      }
    }

    return arcs;
  }, [validParticipants, validEvents]);

  /* ---- Handlers ---- */
  const handlePointClick = useCallback(
    (point: object) => {
      const d = point as GlobePoint;
      if (d.pointType === 'participant') {
        onSelectParticipant?.(d.source as Participant);
      } else {
        onSelectEvent?.(d.source as IntelEvent);
      }
    },
    [onSelectParticipant, onSelectEvent],
  );

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
          atmosphereColor="#3b82f6"
          atmosphereAltitude={0.18}
          animateIn={true}

          /* ── Points (participants + events) ── */
          pointsData={pointsData}
          pointLat="lat"
          pointLng="lng"
          pointRadius="pointSize"
          pointAltitude="pointAlt"
          pointColor="pointColor"
          pointLabel="tooltipHtml"
          pointResolution={6}
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
          arcStroke={0.3}
          arcsTransitionDuration={500}

          /* ── Interaction ── */
          enablePointerInteraction={true}
          onGlobeReady={handleGlobeReady}
        />
      )}

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
