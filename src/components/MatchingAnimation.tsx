"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { motion, useAnimation } from "framer-motion";

type Anchor = { x: number; y: number }; // normalized (0..1)

// const DURATION = 8; // seconds (full loop) // reserved

function useContainerSize(ref: React.RefObject<HTMLDivElement>) {
  const [size, setSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = el.getBoundingClientRect();
      setSize({ w: r.width, h: r.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);

  return size;
}

const ease = [0.6, 0.05, 0.2, 1] as const;

const centerAnchor: Anchor = { x: 0.5, y: 0.5 };

function anchors3x3(): Anchor[] {
  const g = [1 / 6, 0.5, 5 / 6];
  const out: Anchor[] = [];
  for (let yi = 0; yi < 3; yi++) {
    for (let xi = 0; xi < 3; xi++) {
      out.push({ x: g[xi], y: g[yi] });
    }
  }
  return out;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function CircleGlyph({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <circle cx="28" cy="28" r="18" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="28" cy="28" r="10" stroke="currentColor" strokeWidth="1.5" opacity={0.9} />
      <circle cx="28" cy="28" r="3" fill="currentColor" />
      {[0, 90, 180, 270].map((a) => (
        <circle
          key={a}
          cx={28 + 18 * Math.cos((a * Math.PI) / 180)}
          cy={28 + 18 * Math.sin((a * Math.PI) / 180)}
          r="2.5"
          fill="currentColor"
        />
      ))}
    </svg>
  );
}

function SquareGlyph({ size = 54 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <rect x="11" y="11" width="34" height="34" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="18" y="18" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="1.5" opacity={0.9} />
      {[{ x: 11, y: 11 }, { x: 45, y: 11 }, { x: 11, y: 45 }, { x: 45, y: 45 }].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
      ))}
    </svg>
  );
}

function TriangleGlyph({ size = 58 }: { size?: number }) {
  const p1 = { x: 28, y: 8 };
  const p2 = { x: 8, y: 46 };
  const p3 = { x: 48, y: 46 };
  const ip1 = { x: 28, y: 16 };
  const ip2 = { x: 16, y: 38 };
  const ip3 = { x: 40, y: 38 };
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <path d={`M ${p1.x} ${p1.y} L ${p2.x} ${p2.y} L ${p3.x} ${p3.y} Z`} stroke="currentColor" strokeWidth="1.5" />
      <path d={`M ${ip1.x} ${ip1.y} L ${ip2.x} ${ip2.y} L ${ip3.x} ${ip3.y} Z`} stroke="currentColor" strokeWidth="1.5" opacity={0.9} />
      {[p1, p2, p3].map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="currentColor" />
      ))}
    </svg>
  );
}

// Simple monochrome logo SVGs (minimalist)
/*
function SlackLogo({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <g stroke="currentColor" strokeWidth="3" strokeLinecap="round">
        <path d="M20 10 v12" />
        <path d="M16 22 h12" />
        <path d="M36 46 v-12" />
        <path d="M40 34 h-12" />
        <path d="M10 36 h12" />
        <path d="M22 40 v-12" />
        <path d="M46 20 h-12" />
        <path d="M34 16 v12" />
      </g>
    </svg>
  );
}

function DiscordLogo({ size = 56 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <path
        d="M18 20c5-3 15-3 20 0 2 1 4 5 5 8-2 1-4 2-6 3-1-2-2-3-2-3-3 1-10 1-13 0 0 0-1 1-2 3-2-1-4-2-6-3 1-3 3-7 5-8z"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <circle cx="23" cy="27" r="2" fill="currentColor" />
      <circle cx="33" cy="27" r="2" fill="currentColor" />
    </svg>
  );
}

function TelegramLogo({ size = 52 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <path d="M8 28 L48 12 L40 44 L28 34 L20 40 L22 30 Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M22 30 L34 22" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function LinkedInLogo({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" className="text-white/90" fill="none">
      <rect x="10" y="14" width="36" height="28" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="22" width="6" height="14" fill="currentColor" />
      <circle cx="17" cy="19" r="3" fill="currentColor" />
      <path d="M26 36 v-10 h6 m0 0 c6 0 6 4 6 6 v4" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
*/

export default function MatchingAnimation({ logos = false }: { logos?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  // cast to satisfy strict RefObject<HTMLDivElement>
  const { w, h } = useContainerSize(containerRef as unknown as React.RefObject<HTMLDivElement>);
  const grid = useMemo(() => anchors3x3(), []);

  // support up to 4 elements; use first N based on mode
  const c0 = useAnimation();
  const c1 = useAnimation();
  const c2 = useAnimation();
  const c3 = useAnimation();
  const o0 = useAnimation();
  const o1 = useAnimation();
  const o2 = useAnimation();
  const o3 = useAnimation();
  const s0 = useAnimation();
  const s1 = useAnimation();
  const s2 = useAnimation();
  const s3 = useAnimation();

  const controls = useMemo(() => [c0, c1, c2, c3] as const, [c0, c1, c2, c3]);
  const opacityControls = useMemo(() => [o0, o1, o2, o3] as const, [o0, o1, o2, o3]);
  const scaleControls = useMemo(() => [s0, s1, s2, s3] as const, [s0, s1, s2, s3]);
  const count = logos ? 4 : 3;

  const [points, setPoints] = useState<Anchor[]>([
    { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 },
    { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 },
    { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 },
    { x: Math.random() * 0.8 + 0.1, y: Math.random() * 0.8 + 0.1 },
  ]);
  const [showLines, setShowLines] = useState(false);
  const [pathProgress, setPathProgress] = useState(0);

  const toPercent = (a: Anchor) => ({ left: `${a.x * 100}%`, top: `${a.y * 100}%` });
  const toPx = (a: Anchor) => ({ x: a.x * w, y: a.y * h });

  // Timeline orchestrator
  useEffect(() => {
    let mounted = true;

    const run = async () => {
      while (mounted) {
        // Stage 1 — Idle Fade-In (0-1s)
        const startAnchors = [pick(grid), pick(grid), pick(grid), pick(grid)];
        setPoints(startAnchors);
        await Promise.all(
          Array.from({ length: count }, (_, i) =>
            Promise.all([
              controls[i].set(toPercent(startAnchors[i])),
              opacityControls[i].start({ opacity: [0, 1], transition: { duration: 0.8, ease } }),
              scaleControls[i].start({ scale: 1, transition: { duration: 0 } }),
            ])
          )
        );

        if (logos) {
          // Continuous drifting search for logos mode
          for (let hop = 0; hop < 6 && mounted; hop++) {
            const next = [pick(grid), pick(grid), pick(grid), pick(grid)];
            setPoints(next);
            await Promise.all(
              Array.from({ length: count }, (_, i) =>
                controls[i].start({ ...toPercent(next[i]), transition: { duration: 1.1, ease } })
              )
            );
          }
          continue; // loop again
        }

        // Stage 2 — Search (1-4s) 3 hops
        for (let hop = 0; hop < 3; hop++) {
          const next = [pick(grid), pick(grid), pick(grid)];
          setPoints(next);
          await Promise.all(
            [0, 1, 2].slice(0, count).map((i) =>
              controls[i].start({ ...toPercent(next[i]), transition: { duration: 0.9, ease } })
            )
          );
        }

        // Stage 3 — Connect (4-6s)
        setShowLines(true);
        setPathProgress(0);
        await new Promise((r) => setTimeout(r, 50));
        setPathProgress(1);
        await new Promise((r) => setTimeout(r, 1200));

        // Stage 4 — Align & Pulse (6-8s)
        setPoints([centerAnchor, centerAnchor, centerAnchor]);
        await Promise.all(
          [0, 1, 2].slice(0, count).map((i) =>
            controls[i].start({ ...toPercent(centerAnchor), transition: { duration: 0.9, ease } })
          )
        );
        await Promise.all(
          [0, 1, 2].slice(0, count).map((i) =>
            scaleControls[i].start({ scale: [1, 1.18, 1], transition: { duration: 0.7, ease } })
          )
        );
        setShowLines(false);
        await Promise.all(
          [0, 1, 2].slice(0, count).map((i) => opacityControls[i].start({ opacity: [1, 0.6, 1], transition: { duration: 0.3 } }))
        );
      }
    };

    run();
    return () => {
      mounted = false;
    };
  }, [controls, opacityControls, scaleControls, grid, count, logos]);

  const pathCoords = points.map(toPx);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      {/* Grid */}
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-6 p-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-white/10 bg-white/[0.015]" />)
        )}
      </div>

      {/* Connecting lines layer */}
      <svg className="absolute inset-0" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
        {showLines && w > 0 && h > 0 && (
          <motion.path
            d={`M ${pathCoords[0].x} ${pathCoords[0].y} L ${pathCoords[1].x} ${pathCoords[1].y} L ${pathCoords[2].x} ${pathCoords[2].y} Z`}
            stroke="white"
            strokeOpacity={0.9}
            strokeWidth={1}
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: pathProgress }}
            transition={{ duration: 1.2, ease }}
          />
        )}
      </svg>

      {/* Glyphs layer */}
      {[CircleGlyph, SquareGlyph, TriangleGlyph].map((Glyph, i) => (
        <motion.div
          key={i}
          className="absolute -translate-x-1/2 -translate-y-1/2 mix-blend-lighten [filter:drop-shadow(0_0_8px_rgba(255,255,255,0.2))]"
          animate={controls[i]}
          initial={{ left: "50%", top: "50%" }}
          style={{ pointerEvents: "none" }}
        >
          <motion.div animate={scaleControls[i]}>
            <motion.div animate={opacityControls[i]}>
              <Glyph />
            </motion.div>
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
}

/* Example usage

<section className="w-full h-[400px] bg-black">
  <MatchingAnimation />
</section>

*/


