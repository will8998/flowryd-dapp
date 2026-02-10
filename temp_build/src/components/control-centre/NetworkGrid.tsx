"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShieldCheck, Zap, ArrowRight, Building2, Database, Network, Layers, Sparkles, Plus } from 'lucide-react';
import { participants } from '@/lib/canton-data';
import { LiquidGlass } from './LiquidPrimitives';

interface NetworkGridProps {
  onSelectStack: (stack: any) => void;
}

export const NetworkGrid: React.FC<NetworkGridProps> = ({ onSelectStack }) => {
  const [filter, setFilter] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) || 
                         p.cantonRole.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || p.cantonRole.toUpperCase().includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  const ROLES = ['ALL', 'REGISTRY', 'ISSUER', 'CUSTODY', 'EXCHANGE', 'LIQUIDITY', 'COMPLIANCE'];

  const FEATURED_STACKS = [
    {
      id: 'stack_tokenization',
      name: 'Tokenized Asset Stack',
      desc: 'Complete issuer-to-custody workflow.',
      partners: ['7RIDGE', 'Texture', 'Fairmint', 'C7 Identity'],
      fee: '3%',
      nodes: [
        { role: 'Issuer', participantId: 'p7', position: { x: 0, y: -100 } },
        { role: 'Broker', participantId: 'p3', position: { x: -200, y: 100 } },
        { role: 'Registry', participantId: 'p2', position: { x: 200, y: 100 } }
      ]
    },
    {
      id: 'stack_repo',
      name: 'Verified Repo Stack',
      desc: 'Institutional collateral mobility.',
      partners: ['C7 Identity', 'Kaiko', 'Canton Wallet'],
      fee: '2%',
      nodes: [
        { role: 'Lender', participantId: 'p4', position: { x: -200, y: -50 } },
        { role: 'Borrower', participantId: 'p1', position: { x: 200, y: -50 } },
        { role: 'Oracle', participantId: 'p6', position: { x: 0, y: 150 } }
      ]
    },
    {
      id: 'stack_onboard',
      name: 'Onboarding Stack',
      desc: 'KYC/AML compliance suite.',
      partners: ['C7 Identity', 'Memora', 'IntellectEU'],
      fee: '3%',
      nodes: [
        { role: 'Identity', participantId: 'p5', position: { x: 0, y: -100 } },
        { role: 'Storage', participantId: 'p8', position: { x: -150, y: 100 } },
        { role: 'Infra', participantId: 'p9', position: { x: 150, y: 100 } }
      ]
    }
  ];

  return (
    <div className="h-full flex flex-col bg-[#020202]">
      <div className="px-8 pt-8 pb-6 border-b border-white/5 space-y-6 bg-black/20 backdrop-blur-md z-10">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <h2 className="text-3xl font-black italic font-mono uppercase tracking-tighter text-blue-500">Discover Network</h2>
            <p className="text-white/40 text-xs font-mono lowercase tracking-tight">Step 1: Identify partners or select a ready-made stack</p>
          </div>
          
          <div className="flex gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
               <input 
                 type="text"
                 value={filter}
                 onChange={(e) => setFilter(e.target.value)}
                 placeholder="Search Directory..."
                 className="w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all font-mono"
               />
             </div>
             <div className="flex gap-1 p-1 bg-white/5 border border-white/10 rounded-xl overflow-x-auto no-scrollbar max-w-md">
              {ROLES.slice(0, 5).map(r => (
                <button 
                  key={r}
                  onClick={() => setSelectedRole(r)}
                  className={`px-3 py-1.5 rounded-lg text-[9px] font-bold tracking-widest transition-all whitespace-nowrap ${selectedRole === r ? 'bg-white text-black' : 'text-white/40 hover:text-white'}`}
                >
                  {r}
                </button>
              ))}
             </div>
          </div>
        </div>

        <div>
           <p className="text-[9px] font-bold text-white/20 uppercase tracking-widest mb-3 pl-1">Ready-Made Flow Templates</p>
           <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {FEATURED_STACKS.map((stack) => (
                <button 
                  key={stack.id}
                  onClick={() => onSelectStack(stack)}
                  className="text-left group shrink-0 w-64"
                >
                  <LiquidGlass className="p-4 border-blue-500/10 hover:border-blue-500/50 bg-blue-500/5 hover:bg-blue-500/10 transition-all">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-blue-500/20 rounded-lg text-blue-400">
                              <Layers className="w-3.5 h-3.5" />
                           </div>
                           <h3 className="text-xs font-black italic font-mono uppercase text-white group-hover:text-blue-400 transition-colors truncate w-32">{stack.name}</h3>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                           <Plus className="w-3 h-3" />
                        </div>
                     </div>
                     <p className="text-[10px] text-white/40 mb-3 line-clamp-1">{stack.desc}</p>
                     <div className="flex items-center justify-between">
                        <div className="flex -space-x-1.5">
                           {stack.partners.slice(0, 4).map((p, i) => (
                              <div key={i} className="w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center text-[6px] font-bold text-white/40" title={p}>
                                 {p.charAt(0)}
                              </div>
                           ))}
                        </div>
                        <span className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">{stack.fee} Fee</span>
                     </div>
                  </LiquidGlass>
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-grid-white/[0.02]">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredParticipants.map((p, i) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-[#0a0a0a] border border-white/10 rounded-[24px] p-5 hover:border-blue-500/30 hover:bg-white/[0.01] transition-all group relative overflow-hidden cursor-pointer"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  {p.name.includes('Goldman') || p.name.includes('Bank') ? <Building2 className="w-5 h-5 text-blue-500" /> : 
                   p.name.includes('DTCC') ? <Database className="w-5 h-5 text-blue-500" /> : 
                   <Network className="w-5 h-5 text-blue-500" />}
                </div>
                <div className="flex gap-1">
                   {p.superValidator && (
                     <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" title="Super Validator" />
                   )}
                   <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" title="VP Badge" />
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black italic font-mono uppercase tracking-tighter text-white group-hover:text-blue-400 transition-colors truncate">{p.name}</h3>
                <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold truncate">{p.cantonRole}</p>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
                 <span className="text-[9px] text-white/40 font-mono">{p.validatorNodes ? `${p.validatorNodes} Nodes` : 'Hosted'}</span>
                 <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
