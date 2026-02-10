"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, MessageSquare, ArrowRight, Activity, LineChart, ShieldCheck } from 'lucide-react';

export const ActivateEngine: React.FC = () => {
  const DEALS = [
    { id: 'pf1', name: 'Repo_Settlement_v2', participants: ['Texture', 'DTCC', 'Kaiko'], volume: '$2.4B', status: 'LIVE', activity: '2m ago' },
    { id: 'pf2', name: 'Bond_Issuance_098', participants: ['Goldman', 'BNY Mellon'], volume: '$500M', status: 'SYNCING', activity: '14m ago' },
    { id: 'pf3', name: 'Collateral_Swap_Intraday', participants: ['Euroclear', 'Texture'], volume: '$1.2B', status: 'DEALING', activity: 'Just now' }
  ];

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end bg-black/40 backdrop-blur-md p-6 border border-white/5 rounded-[32px]">
        <div className="space-y-1">
          <h2 className="text-2xl font-black italic font-mono uppercase tracking-tighter text-emerald-500">Active Deals</h2>
          <p className="text-white/40 text-xs font-mono lowercase tracking-tight">Stage 3: Finalise and monitor your institutional workflows</p>
        </div>
        <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest font-mono">3 Active Rooms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {DEALS.map((deal, i) => (
          <motion.div
            key={deal.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-4 hover:border-emerald-500/50 transition-all group flex flex-col md:flex-row justify-between md:items-center gap-4"
          >
            <div className="flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-emerald-500" />
               </div>
               <div className="space-y-0.5">
                  <h3 className="text-sm font-black italic font-mono uppercase text-white group-hover:text-emerald-400 transition-colors">{deal.name}</h3>
                  <div className="flex items-center gap-2">
                     <div className="flex -space-x-1">
                        {deal.participants.map(p => (
                          <div key={p} className="w-4 h-4 rounded-full bg-blue-600 border border-black text-[5px] flex items-center justify-center font-bold">{p.charAt(0)}</div>
                        ))}
                     </div>
                     <span className="text-[8px] font-mono text-white/20 uppercase">{deal.participants.join(' • ')}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-6">
               <div className="text-right hidden xl:block">
                  <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Vol</p>
                  <p className="text-xs font-black italic font-mono text-white/80">{deal.volume}</p>
               </div>
               <div className="text-right">
                  <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Status</p>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                     <span className={`w-1 h-1 rounded-full ${deal.status === 'LIVE' ? 'bg-emerald-500' : 'bg-blue-500'} animate-pulse`} />
                     <span className="text-[7px] font-bold text-white/60 tracking-widest">{deal.status}</span>
                  </div>
               </div>
               <button className="px-4 py-2 bg-white text-black rounded-lg font-black italic font-mono text-[9px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-1.5 group/btn">
                  Enter <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
