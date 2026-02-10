"use client";

import React, { useMemo, useState } from "react";

type RoleKey = "super_validator" | "app_builder" | "user_validator";

const roleMeta: Record<RoleKey, { title: string; reward: string; icon: string; blurb: string }> = {
  super_validator: {
    title: "Super Validator",
    reward: "35% Canton Coins",
    icon: "⚡",
    blurb: "Provide critical infrastructure with 99.99% uptime",
  },
  app_builder: {
    title: "Application Builder",
    reward: "50% Canton Coins",
    icon: "🔧",
    blurb: "Deploy smart contracts and build applications",
  },
  user_validator: {
    title: "User / Validator",
    reward: "15% Canton Coins",
    icon: "👥",
    blurb: "Participate in transactions and validation",
  },
};

const cn = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(" ");

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("Digital National");
  const [orgType, setOrgType] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [role, setRole] = useState<RoleKey | "">("");
  const [readiness, setReadiness] = useState(7);
  const [connections, setConnections] = useState(0);
  const [volume, setVolume] = useState("");

  const [infra, setInfra] = useState<string[]>(["node_operation", "high_availability", "24x7"]);
  const [services, setServices] = useState<string[]>(["custody", "settlement"]);
  const [assets, setAssets] = useState<string[]>(["securities", "stablecoins"]);

  const canContinue = useMemo(() => {
    if (step === 1) return !!orgName && !!orgType && !!jurisdiction;
    if (step === 2) return !!role;
    return true;
  }, [step, orgName, orgType, jurisdiction, role]);

  const continueStep = () => setStep((s) => Math.min(4, s + 1));
  const backStep = () => setStep((s) => Math.max(1, s - 1));

  return (
    <main className="min-h-[100svh] bg-gradient-to-br from-[#0b0f1a] to-[#0f172a] text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
        {/* header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            Onboard your <span style={{ color: "#c4ff61" }}>Flowryd</span> node
          </h1>
          <p className="text-white/60 mt-2">
            Configure your experience and preview high‑match opportunities in minutes.
          </p>
        </div>

        {/* progress */}
        <div className="relative mb-8">
          <div className="absolute left-0 right-0 top-[18px] h-px bg-white/10" />
          <div className="grid grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="text-center relative">
                <div
                  className={cn(
                    "mx-auto w-10 h-10 rounded-full flex items-center justify-center border text-sm font-semibold",
                    step === n && "border-white/40 bg-white/10",
                    step > n && "bg-emerald-500 border-emerald-500",
                    step < n && "border-white/20 bg-black"
                  )}
                >
                  {n}
                </div>
                <div className={cn("mt-1 text-xs text-white/40", step === n && "text-[#c4ff61]")}>Step {n}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur p-6 md:p-8">
          {/* Step 1 */}
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-light mb-2">Tell us about your organization</h2>
              <p className="text-white/60 mb-6">
                This information helps us match you with the right opportunities and partners in the Canton
                Network.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Organization Name</label>
                  <input
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Organization Type</label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                    value={orgType}
                    onChange={(e) => setOrgType(e.target.value)}
                  >
                    <option value="">Select type…</option>
                    <option value="validator">Validator Infrastructure Provider</option>
                    <option value="bank">Bank</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="exchange">Exchange</option>
                    <option value="custodian">Custodian</option>
                    <option value="fintech">FinTech / Technology Provider</option>
                    <option value="market_maker">Market Maker</option>
                    <option value="issuer">Issuer</option>
                    <option value="service_provider">Service Provider</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Primary Jurisdiction</label>
                  <select
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                    value={jurisdiction}
                    onChange={(e) => setJurisdiction(e.target.value)}
                  >
                    <option value="">Select jurisdiction…</option>
                    <option value="us">United States</option>
                    <option value="uk">United Kingdom</option>
                    <option value="eu">European Union</option>
                    <option value="ch">Switzerland</option>
                    <option value="sg">Singapore</option>
                    <option value="jp">Japan</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  disabled={!canContinue}
                  onClick={continueStep}
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Continue ↗
                </button>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-light mb-2">Select your Canton Network role</h2>
              <p className="text-white/60 mb-6">Your role determines your Canton Coin allocation and responsibilities.</p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {(Object.keys(roleMeta) as RoleKey[]).map((k) => (
                  <button
                    key={k}
                    onClick={() => setRole(k)}
                    className={cn(
                      "text-left rounded-2xl border p-4 transition",
                      "border-white/15 bg-black/40 hover:border-white/30",
                      role === k && "border-violet-400 bg-gradient-to-br from-violet-500/10 to-cyan-400/10"
                    )}
                  >
                    <div className="text-2xl mb-1">{roleMeta[k].icon}</div>
                    <div className="font-medium">{roleMeta[k].title}</div>
                    <div className="text-[#c4ff61] text-sm">{roleMeta[k].reward}</div>
                    <div className="text-white/60 text-sm mt-1">{roleMeta[k].blurb}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={backStep} className="rounded-lg border border-white/15 px-4 py-2 text-sm">← Back</button>
                <button
                  disabled={!canContinue}
                  onClick={continueStep}
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium disabled:opacity-50"
                >
                  Continue ↗
                </button>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-light mb-2">What are your capabilities?</h2>
              <p className="text-white/60 mb-6">Select all that apply. This helps us match you with compatible workflows.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <CheckboxGroup
                  title="Infrastructure"
                  state={infra}
                  setState={setInfra}
                  options={[
                    ["node_operation", "Node Operation"],
                    ["high_availability", "High Availability (99.9%+)"],
                    ["24x7", "24/7 Operations"],
                    ["smart_contracts", "Smart Contract Development"],
                  ]}
                />
                <CheckboxGroup
                  title="Financial Services"
                  state={services}
                  setState={setServices}
                  options={[
                    ["custody", "Custody"],
                    ["settlement", "Settlement"],
                    ["trading", "Trading"],
                    ["market_making", "Market Making"],
                  ]}
                />
                <CheckboxGroup
                  title="Asset Classes"
                  state={assets}
                  setState={setAssets}
                  options={[
                    ["securities", "Securities"],
                    ["stablecoins", "Stablecoins"],
                    ["derivatives", "Derivatives"],
                    ["tokenized_assets", "Tokenized Assets"],
                  ]}
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={backStep} className="rounded-lg border border-white/15 px-4 py-2 text-sm">← Back</button>
                <button onClick={continueStep} className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium">
                  Continue ↗
                </button>
              </div>
            </div>
          )}

          {/* Step 4 */}
          {step === 4 && (
            <div>
              <h2 className="text-2xl font-light mb-2">Your current network status</h2>
              <p className="text-white/60 mb-6">Help us understand your existing position in the network.</p>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-white/60 mb-1">Infrastructure Readiness ({readiness}/10)</label>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={readiness}
                    onChange={(e) => setReadiness(parseInt(e.target.value))}
                    className="w-full accent-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Existing Canton Network Connections</label>
                  <input
                    type="number"
                    value={connections}
                    onChange={(e) => setConnections(parseInt(e.target.value || "0"))}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1">Monthly Transaction Volume (Optional)</label>
                  <select
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/40 px-4 py-3 outline-none focus:border-white/30"
                  >
                    <option value="">Select range…</option>
                    <option value="0">No volume yet</option>
                    <option value="1000">{`< $1M`}</option>
                    <option value="10000">$1M - $10M</option>
                    <option value="100000">$10M - $100M</option>
                    <option value="1000000">$100M - $1B</option>
                    <option value="10000000">{`> $1B`}</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={backStep} className="rounded-lg border border-white/15 px-4 py-2 text-sm">← Back</button>
                <a
                  href="#"
                  onClick={(e) => e.preventDefault()}
                  className="rounded-lg bg-gradient-to-r from-violet-500 to-cyan-400 px-4 py-2 text-sm font-medium"
                >
                  Generate My Dashboard 🚀
                </a>
              </div>

              {/* Preview cards */}
              <div className="grid md:grid-cols-4 gap-4 mt-8">
                {[
                  ["Matching Workflows", "23"],
                  ["Ready to Launch", "8"],
                  ["CC/Month Potential", "45K"],
                  ["Network Score", "92"],
                ].map(([label, number]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-black/40 p-4 text-center">
                    <div className="text-2xl font-semibold" style={{ color: label === "Matching Workflows" ? "#8b5cf6" : label === "Ready to Launch" ? "#10b981" : label === "Network Score" ? "#06b6d4" : "#f59e0b" }}>
                      {number}
                    </div>
                    <div className="text-xs text-white/60 uppercase tracking-wide">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function CheckboxGroup({
  title,
  options,
  state,
  setState,
}: {
  title: string;
  options: [string, string][];
  state: string[];
  setState: (v: string[]) => void;
}) {
  const toggle = (k: string) =>
    setState(state.includes(k) ? state.filter((x) => x !== k) : [...state, k]);
  return (
    <div>
      <div className="mb-2 font-medium">{title}</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map(([k, label]) => (
          <label key={k} className="relative rounded-lg border border-white/10 bg-black/40 px-3 py-3 cursor-pointer select-none hover:border-white/30">
            <input
              type="checkbox"
              className="absolute opacity-0"
              checked={state.includes(k)}
              onChange={() => toggle(k)}
            />
            <span className={cn("text-sm", state.includes(k) && "text-[#c4ff61]")}>{label}</span>
            <span className={cn("absolute right-3 top-1/2 -translate-y-1/2 text-emerald-400", state.includes(k) ? "opacity-100" : "opacity-0")}>✓</span>
          </label>
        ))}
      </div>
    </div>
  );
}



