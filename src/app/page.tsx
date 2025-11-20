"use client";
import MatchingAnimation from "@/components/MatchingAnimation";
import TypeWord from "@/components/TypeWord";
import Framework from "@/components/Framework";
// Link not currently used; keep imports minimal
import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const heroRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    let raf = 0;
    let lastX = 0, lastY = 0;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width; // -0.5..0.5
      const dy = (e.clientY - cy) / rect.height;
      const magnitude = 12; // px
      lastX = -dx * magnitude;
      lastY = -dy * magnitude;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const apply = () => {
      el.style.setProperty("--px", `${lastX.toFixed(2)}px`);
      el.style.setProperty("--py", `${lastY.toFixed(2)}px`);
      raf = 0;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);
  return (
    <div className="relative min-h-screen text-foreground bg-background">
      {/* Sticky CTA removed */}
      {/* Header moved to layout */}

      {/* HERO (LayerZero-like structure) */}
      <section ref={heroRef} className="lzr-background pt-24 md:pt-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="space-y-6">
              <h1 className="headline-xl tracking-tight">
                <span className="block text-[56px] md:text-[96px] lg:text-[120px]">Flow</span>
                <span className="block text-[56px] md:text-[96px] lg:text-[120px]">
                  <TypeWord className="font-inherit" words={["Fast", "Right", "Ryd"]} />
                </span>
                <span className="block text-[56px] md:text-[96px] lg:text-[120px]">Together</span>
              </h1>
              <div className="space-y-4">
                <div className="kicker">Your network advantage, decoded.</div>
                <div className="text-white/70 max-w-3xl space-y-3">
                  <p className="text-lg md:text-xl leading-relaxed">
                    30,000 participants. Half a million daily transactions. Parabolic growth horizon.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed">
                    Your position in the network defines your potential.
                  </p>
                  <p className="text-lg md:text-xl leading-relaxed">
                    But in a market moving this fast, understanding that position—and acting on it—is everything.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 max-w-[720px]">
                <a
                  href="https://flowryd.typeform.com/to/z4N2MGrQ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 group inline-flex items-center justify-between min-h-12 border border-white/30 hover:border-white/60 rounded px-4 py-3"
                >
                  <span className="text-white/90 text-base md:text-lg leading-snug">Sign Up Now</span>
                  <span className="transition-transform group-hover:translate-x-0.5">↗</span>
                </a>
                <Link
                  href="/discover"
                  className="flex-1 group inline-flex items-center justify-between min-h-12 bg-white/5 border border-white/10 hover:bg-white/10 rounded px-4 py-3 transition-colors"
                >
                  <span className="text-white/90 text-base md:text-lg leading-snug">Discover Network</span>
                  <span className="transition-transform group-hover:translate-x-0.5">→</span>
                </Link>
              </div>
            </div>
            <div className="relative h-[320px] md:h-[420px] lg:h-[520px]"></div>
          </div>
        </div>
      </section>

  
      {/* SECTIONS */}
      <main>
        <section id="problem" className="section border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
              {/* Left grid panel (visual) */}
              <div className="md:col-span-5">
                <div className="nav-compact text-white/70 mb-3">[ 01 / 06 ]</div>
                <div className="relative h-[520px] rounded border border-white/10 overflow-hidden bg-black/40">
                  {/* subtle grid pattern */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="w-full h-full" style={{
                      backgroundImage: `repeating-linear-gradient(0deg, transparent 0px, transparent 23px, rgba(255,255,255,0.06) 23px, rgba(255,255,255,0.06) 24px),repeating-linear-gradient(90deg, transparent 0px, transparent 23px, rgba(255,255,255,0.06) 23px, rgba(255,255,255,0.06) 24px)`
                    }} />
                  </div>
                  {/* 3x3 icon tiles — sequential fade one-at-a-time */}
                  <div className="absolute inset-6 grid grid-cols-3 grid-rows-3 gap-6">
                  {Array.from({ length: 9 }).map((_, i) => {
                    // Deterministic pseudo-random based on tile index to avoid hydration mismatch
                    const seed = (n: number) => {
                      const s = Math.sin(n * 12.9898) * 43758.5453;
                      return s - Math.floor(s);
                    };
                    const r1 = seed(i + 1);
                    const r2 = seed(i + 11);
                    const r3 = seed(i + 21);
                    const delay = `${(r1 * 2.8).toFixed(2)}s`;
                    const dur = `${(2 + r2 * 3).toFixed(2)}s`;
                    const tx = `${(r3 * 2 - 1).toFixed(1)}px`;
                    const ty = `${(seed(i + 31) * 2 - 1).toFixed(1)}px`;
                    return (
                      <div
                        key={i}
                        className="pulse-tile border border-white/10 bg-black/30 rounded flex items-center justify-center"
                        style={{ ["--d" as string]: delay, ["--t" as string]: dur, ["--tx" as string]: tx, ["--ty" as string]: ty }}
                        aria-hidden
                      >
                        {/* choose large icon by index: plane, dice, clock, grid */}
                        {(() => {
                          switch (i % 4) {
                            case 0:
                              return (
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white/80">
                                  <path d="M3 11l18-8-8 18-2-7-8-3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                </svg>
                              );
                            case 1:
                              return (
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white/80">
                                  <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                                  <circle cx="9" cy="9" r="1.8" fill="currentColor" />
                                  <circle cx="15" cy="15" r="1.8" fill="currentColor" />
                                </svg>
                              );
                            case 2:
                              return (
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white/80">
                                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                                  <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                              );
                            default:
                              return (
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" className="text-white/80">
                                  <rect x="5" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                                  <rect x="14" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                                  <rect x="5" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                                  <rect x="14" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                                </svg>
                              );
                          }
                        })()}
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>

              {/* Right content panel (text + CTAs) */}
              <div className="md:col-span-7">
                <div className="nav-compact mb-6">THE PROBLEM</div>

                <div className="space-y-6">
                  <h2 className="text-white text-2xl md:text-3xl font-medium leading-tight">
                    You&apos;re in formation.
                  </h2>

                  <p className="text-white/80 text-lg leading-relaxed">
                    You&apos;re in the network early. You made the bet. Committed resources.
                  </p>
                  <p className="text-white/80 text-lg leading-relaxed">
                    How do you convert this to market share?
                  </p>

                  <div className="space-y-4">
                    <h3 className="text-white text-xl font-medium">The current play:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Box 1 */}
                      <div className="flex items-start gap-3 p-4 rounded border border-white/10 bg-black/30">
                        <div className="shrink-0 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                          {/* paper plane */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
                            <path d="M3 11l18-8-8 18-2-7-8-3z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Random outreach</div>
                          <div className="text-white/70">Instead of understanding who fits your position</div>
                        </div>
                      </div>

                      {/* Box 2 */}
                      <div className="flex items-start gap-3 p-4 rounded border border-white/10 bg-black/30">
                        <div className="shrink-0 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                          {/* dice */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
                            <rect x="4" y="4" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="9" cy="9" r="1.2" fill="currentColor" />
                            <circle cx="15" cy="15" r="1.2" fill="currentColor" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Guessing on partners</div>
                          <div className="text-white/70">Instead of knowing which match your capabilities</div>
                        </div>
                      </div>

                      {/* Box 3 */}
                      <div className="flex items-start gap-3 p-4 rounded border border-white/10 bg-black/30">
                        <div className="shrink-0 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                          {/* clock */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
                            <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M12 7v6l4 2" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Chasing yesterday’s wins</div>
                          <div className="text-white/70">Instead of spotting patterns forming in your space</div>
                        </div>
                      </div>

                      {/* Box 4 */}
                      <div className="flex items-start gap-3 p-4 rounded border border-white/10 bg-black/30">
                        <div className="shrink-0 w-8 h-8 rounded-full border border-white/30 flex items-center justify-center">
                          {/* grid */}
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80">
                            <rect x="5" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="14" y="5" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="5" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="14" y="14" width="5" height="5" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">Generic strategies</div>
                          <div className="text-white/70">Instead of moves tailored to where you are</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-white/80 text-lg leading-relaxed border-l-2 border-white/20 pl-4">
                    Your position determines what you can capture.<br /><br />
                    Generic intelligence can&apos;t decode that.<br /><br />
                    Don&apos;t be late. First Position. Then Flow.
                  </p>
                </div>

                {/* CTA row removed as requested */}
              </div>
            </div>
          </div>
        </section>

        <section id="what" className="section border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-5xl md:text-6xl font-semibold mb-6">A new playbook</h2>
              <p className="text-white/70 text-xl">Your Network D-N-A</p>
            </div>

            <div className="mb-6 flex items-center gap-3">
              <Image src="/flow.svg" alt="Flowryd Flow Logo" width={32} height={32} className="h-8 w-8" />
              <div className="text-2xl font-semibold text-white">The Flowryd Code</div>
            </div>

            <Framework />
            <div className="mt-8 border-t border-white/10 pt-6" id="intelligence">
              <div className="nav-compact text-white/70 mb-2">Active intelligence. Your advantage.</div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-white/70">
                <div className="panel p-3 md:col-span-4 relative">
                  <div className="nav-compact mb-2">INCOMING_TX <span className="text-white/50">— Signals in</span></div>
                  <div className="cells">
                    {Array.from({ length: 200 }).map((_, i) => (
                      <div key={i} className="cell" style={{ animationDelay: `${(i%10)*0.1}s` }} />
                    ))}
                  </div>
                  <div className="tx-pulse" />
                </div>
                <div className="panel p-3 md:col-span-4">
                <div className="nav-compact mb-2">Agentic modeling and prototype flows</div>
                  <div className="glow-bar-list">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="glow-bar" style={{ animationDelay: `${i*0.25}s` }} />
                    ))}
                  </div>
                </div>
                <div className="panel p-3 md:col-span-4">
                <div className="nav-compact mb-2">Offer acceptance and onboarding automations</div>
                  <div className="flicker py-10 diamond-pulse">
                    <div className="eth-diamond" />
                    <div className="text-center mt-4 text-white/60 nav-compact">— Flow deployed on Flowryd</div>
                  </div>
                </div>
              </div>
              <p className="mt-8 text-white/70 text-center">Every connection becomes a flow. Every flow becomes a blueprint.</p>
              <div className="mt-6 panel p-4 mx-auto max-w-2xl text-center">
                <div className="nav-compact mb-1">REWARD</div>
                <div className="font-medium mb-1">Blueprint Marketplace & Rewards</div>
                <p className="text-white/80">Share in rewards as your blueprints power active flows.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Two-column momentum section */}
        <section id="moment" className="section border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="stage-rail mb-6"></div>
            <h2 className="text-3xl md:text-4xl font-semibold text-white text-center mb-8">
              Markets are moving on-chain. First-mover advantages being locked now.
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded border border-white/10 bg-black/30">
                <div className="nav-compact text-white/70 mb-4">Only a fraction of flow is on-chain:</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* spark icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><path d="M12 2l2.2 5.5L20 10l-5.5 2-2.5 6-2-6L4 10l6-2.5L12 2z" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Massive opportunity unclaimed</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* target icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Strategic positions open</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* nodes icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><circle cx="6" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="18" cy="6" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="12" cy="18" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M8 7.5l3 7M16 7.5l-3 7" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Networks just forming</div>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded border border-white/10 bg-black/30">
                <div className="nav-compact text-white/70 mb-4">The Old Gates Are Gone.</div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* unlock icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><rect x="6" y="11" width="12" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/><path d="M9 11V8a3 3 0 0 1 6 0" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Access is democratized</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* shield off icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3z" stroke="currentColor" strokeWidth="1.3"/><path d="M6 6l12 12" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Size no longer protects position</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-md border border-white/10 bg-white/5 flex items-center justify-center">
                      {/* layers icon */}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white/80"><path d="M12 4l8 4-8 4-8-4 8-4z" stroke="currentColor" strokeWidth="1.3"/><path d="M4 12l8 4 8-4" stroke="currentColor" strokeWidth="1.3"/></svg>
                    </div>
                    <div className="text-white/80">Legacy footholds dissolved</div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="text-xl md:text-2xl text-white/80 text-center mt-8">
              No time to wait. Miss formation, miss the market.
            </h3>
            <div className="stage-rail mt-6"></div>
          </div>
        </section>

        
   

        

        {/* GET STARTED replaces Develop with Flowryd */}
        <section id="develop" className="section border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
            <h2 className="text-4xl md:text-5xl font-semibold mb-4">Get Started Now.</h2>
            <p className="text-white/70 max-w-3xl mb-8">Flowryd gives teams the acceleration layer to coordinate participants, reuse blueprints, and move from talks to shipped flows in weeks.</p>
            <div className="grid grid-cols-1 gap-4">
              <a
                href="https://flowryd.typeform.com/to/z4N2MGrQ"
                target="_blank"
                rel="noopener noreferrer"
                className="group rounded border border-white/20 hover:border-white/50 bg-black/30 px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <div className="nav-compact mb-1">Sign Up</div>
                  <div className="text-white/60 text-sm">Join Flowryd and get matched, modeled, and onboarded.</div>
                </div>
                <span className="transition-transform group-hover:translate-x-0.5">↗</span>
              </a>
            </div>
          </div>
        </section>

     

        {/* Social proof strip */}
        <section className="py-6 border-y border-white/10 bg-black/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 nav-compact text-white/70">
            Built for Canton participants: validators, featured apps, 25K+ parties.
          </div>
        </section>

        {/* Application form removed */}

      </main>

      {/* Footer moved to layout */}
    </div>
  );
}
