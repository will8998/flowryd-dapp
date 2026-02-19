"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { useDeals } from '@/hooks/use-deals';

export const ActivateEngine: React.FC = () => {
  const { deals, isLoading, refetch } = useDeals();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'bg-white/40';
      case 'open': return 'bg-blue-500';
      case 'negotiating': return 'bg-yellow-500';
      case 'locked': return 'bg-orange-500';
      case 'committed': return 'bg-emerald-500';
      default: return 'bg-white/40';
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end bg-black/40 backdrop-blur-md p-6 border border-white/5 rounded-[32px]">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold uppercase tracking-tighter text-emerald-500">Active Deals</h2>
          <p className="text-white/40 text-xs lowercase tracking-tight">Stage 3: Finalise and monitor your institutional workflows</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={async () => {
              const res = await fetch('/api/deals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: `Deal ${new Date().toLocaleDateString()}` }),
              });
              if (res.ok) refetch();
            }}
            className="px-4 py-2 bg-emerald-500 text-black rounded-xl font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-400 transition-all"
          >
            + New Deal
          </button>
          <div className="px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <p className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{deals.length} Active Room{deals.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : deals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-white/30 text-sm">No active deals yet</p>
          <p className="text-white/15 text-xs mt-1">Create a deal from the Flow Workbench</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {deals.map((deal, i) => (
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
                    <h3 className="text-sm font-bold uppercase text-white group-hover:text-emerald-400 transition-colors">{deal.title}</h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[8px] text-white/20 uppercase">{deal.status?.toUpperCase() ?? 'DRAFT'}</span>
                    </div>
                 </div>
              </div>

              <div className="flex items-center gap-6">
                 <div className="text-right hidden xl:block">
                    <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest">Vol</p>
                    <p className="text-xs font-bold text-white/80">{deal.volume ?? '—'}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[7px] font-bold text-white/20 uppercase tracking-widest mb-0.5">Status</p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 border border-white/10 rounded-full">
                       <span className={`w-1 h-1 rounded-full ${getStatusColor(deal.status ?? 'draft')} animate-pulse`} />
                       <span className="text-[7px] font-bold text-white/60 tracking-widest">{deal.status?.toUpperCase() ?? 'DRAFT'}</span>
                    </div>
                 </div>
                 <button 
                    onClick={() => window.location.href = `/deals/${deal.id}`}
                    className="px-4 py-2 bg-white text-black rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center gap-1.5 group/btn"
                  >
                    Enter <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
