"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Terminal as TerminalIcon, ArrowRight, Activity, Zap, Workflow, Layers } from 'lucide-react';

interface RydAITerminalProps {
  tier: string;
}

const CONTEXT_MESSAGES: Record<string, string> = {
  DISCOVER: "Scanning Canton Domain 'Production-1'... Identify institutional partners to begin your workflow mission.",
  NAVIGATE: "Flow Workbench active. Drag partners from the tray to model your multi-party coordination flow.",
  ACTIVATE: "Deal Rooms active. Enter a private room to finalise smart contract terms and synchronise state."
};

export const RydAITerminal: React.FC<RydAITerminalProps> = ({ tier }) => {
  const [logs, setLogs] = useState<string[]>([]);
  
  return (
    <div className="w-80 border-l border-white/5 bg-black flex flex-col hidden xl:flex shadow-2xl">
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/5">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Ryd AI</span>
        </div>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
        </div>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto font-mono text-[11px] leading-relaxed">
        <div className="space-y-3">
          <p className="text-blue-400">assistant_ryd:</p>
          <motion.p 
            key={tier}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-white/70 italic border-l border-blue-500/20 pl-4"
          >
            {CONTEXT_MESSAGES[tier] || "Ready to orchestrate."}
          </motion.p>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <h4 className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Active Intelligence</h4>
          <div className="space-y-3">
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
               <Activity className="w-3 h-3 text-blue-500" />
               <div className="flex-1">
                 <p className="text-[10px] font-bold text-white/80">Network Affinity</p>
                 <p className="text-[9px] text-white/40">98% match with DTCC</p>
               </div>
             </div>
             <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10 opacity-50">
               <Zap className="w-3 h-3 text-purple-500" />
               <div className="flex-1">
                 <p className="text-[10px] font-bold text-white/80">Fee Optimization</p>
                 <p className="text-[9px] text-white/40">-12bps potential</p>
               </div>
             </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 space-y-4">
          <h4 className="text-[9px] uppercase font-bold text-white/20 tracking-widest">Recommended Stacks</h4>
          <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-3 group cursor-pointer hover:bg-blue-600/20 transition-all">
            <p className="text-[10px] font-bold text-blue-400">Verified Participant</p>
            <div className="flex gap-1.5">
              <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center text-[8px] text-white/40 font-bold border border-white/5">C7</div>
              <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center text-[8px] text-white/40 font-bold border border-white/5">K</div>
              <div className="w-5 h-5 rounded bg-black/40 flex items-center justify-center text-[8px] text-white/40 font-bold border border-white/5">CW</div>
            </div>
            <p className="text-[9px] text-white/40 leading-snug">Essential for institutional Repo flows.</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-white/5 bg-black">
        <div className="flex gap-2">
          <input 
            type="text" 
            placeholder="Ask Ryd..." 
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-[10px] focus:outline-none focus:border-blue-500/50 transition-all"
          />
          <button className="p-2 bg-blue-600 rounded-lg shadow-lg shadow-blue-600/20">
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
