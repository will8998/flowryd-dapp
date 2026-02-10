"use client";

import React, { useState } from "react";

type Key = "discover" | "network" | "advantage";

const CARDS: Array<{
  key: Key;
  index: string;
  title: string;
  subtitle: string;
  intro: string;
}> = [
  {
    key: "discover",
    index: "01",
    title: "Discover",
    subtitle: "Decode Your Position",
    intro:
      "Understand who you're connected to, what workflows you participate in, and where opportunities exist",
  },
  {
    key: "network",
    index: "02",
    title: "Navigate",
    subtitle: "Chart Your Path",
    intro:
      "Identify critical participants, prioritize connections, and map your path to network formation",
  },
  {
    key: "advantage",
    index: "03",
    title: "Activate",
    subtitle: "Execute Your Strategy",
    intro:
      "Orchestrate connections, trigger workflows, and accelerate on-chain value creation.",
  },
];

export default function Framework() {
  const [active, setActive] = useState<Key>("discover");

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {CARDS.map((c) => (
          <button
            key={c.key}
            onClick={() => setActive(c.key)}
            className={`relative p-6 rounded border bg-black/40 flex flex-col justify-between min-h-[320px] text-left transition-colors ${
              active === c.key ? "border-white/30" : "border-white/10 hover:border-white/30"
            }`}
            aria-pressed={active === c.key}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-6 h-6 rounded-full border border-white/30" />
                <div className="nav-compact text-white/60">{c.index}</div>
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-white">{c.title}</h3>
              <h4 className="text-lg font-medium mb-3 text-white/90">{c.subtitle}</h4>
              <p className="text-sm leading-relaxed text-white/70">{c.intro}</p>
            </div>
          </button>
        ))}
      </div>
      
    </div>
  );
}


