"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Target, 
  Rocket, 
  Workflow, 
  ArrowRight, 
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Plus,
  Briefcase
} from 'lucide-react';

export const CollectiveHub: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('STRATEGY');

  const COLLECTIVE = [
    { 
      id: 'c1', 
      name: 'Oliver Wyman', 
      category: 'STRATEGY', 
      desc: 'Market-leading institutional strategy and Canton adoption frameworks.', 
      specialty: 'D-N-A Methodology' 
    },
    { 
      id: 'c2', 
      name: 'Lippincott', 
      category: 'BRAND', 
      desc: 'Institutional brand design for high-fidelity on-chain ecosystems.', 
      specialty: 'Identity Systems' 
    },
    { 
      id: 'c3', 
      name: 'IntellectEU', 
      category: 'DEV', 
      desc: 'Premier NaaS and Daml engineering for complex Canton workflows.', 
      specialty: 'Ledger Integration' 
    },
    { 
      id: 'c4', 
      name: 'Chainbridge', 
      category: 'DEV', 
      desc: 'Specialized smart contract audits and cross-domain bridging.', 
      specialty: 'Security Audits' 
    }
  ];

  return (
    <div className="h-full flex flex-col p-10 space-y-10 overflow-y-auto custom-scrollbar bg-[#020202]">
      <div className="flex justify-between items-end bg-black/20 backdrop-blur-md p-8 border border-white/5 rounded-[40px]">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold uppercase tracking-tighter text-emerald-500">Flowryd Collective</h2>
          <p className="text-white/40 text-sm lowercase tracking-tight">Institutional service marketplace • Strategy, Dev, Creative</p>
        </div>
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
          {['STRATEGY', 'DEV', 'BRAND'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-8 py-3 rounded-xl text-[10px] font-bold tracking-widest transition-all ${selectedCategory === cat ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-white/40 hover:text-white'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {COLLECTIVE.filter(c => c.category === selectedCategory).map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 space-y-8 hover:border-emerald-500 transition-all group relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
               <Briefcase className="w-16 h-16" />
             </div>
             
             <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-emerald-500/10 rounded-lg">
                     <ShieldCheck className="w-4 h-4 text-emerald-500" />
                   </div>
                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">COLLECTIVE PARTNER</span>
                 </div>
                 <h3 className="text-3xl font-bold uppercase tracking-tighter leading-tight">{member.name}</h3>
                 <p className="text-sm text-white/40 leading-relaxed font-medium lowercase tracking-tight">{member.desc}</p>
              </div>

              <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                   <span className="text-white/20">Specialty</span>
                   <span className="text-white/80">{member.specialty}</span>
                 </div>
                 <button className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group/btn">
                   Engage Partner <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                 </button>
              </div>
          </motion.div>
        ))}

        <div className="bg-emerald-600 rounded-[40px] p-10 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/40">
           <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
           <Plus className="w-12 h-12 text-white group-hover:rotate-90 transition-transform duration-500" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Join Collective</h3>
              <p className="text-emerald-100/60 text-xs">Offer your institutional services to 400+ parties.</p>
            </div>
            <button className="w-full py-4 bg-black text-emerald-500 rounded-2xl font-bold text-xs uppercase tracking-widest">Apply Now</button>
        </div>
      </div>
    </div>
  );
};
