"use client";

import React from "react";
import dynamic from "next/dynamic";

const HeroGlyphs = dynamic(() => import("./HeroGlyphs"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-white/30 text-sm">Loading scene...</div>
    </div>
  ),
});

export default function ClientHero() {
  return (
    <div className="relative h-[320px] md:h-[420px] lg:h-[520px]">
      <HeroGlyphs />
    </div>
  );
}



