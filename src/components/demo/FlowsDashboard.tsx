"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Lock, Plus, ArrowRight, Clock, Users } from 'lucide-react';
import { mockPrivateFlows } from '@/lib/demo-data';

interface FlowsDashboardProps {
  onOpenFlow: (id: string) => void;
}

export const FlowsDashboard: React.FC<FlowsDashboardProps> = ({ onOpenFlow }) => {
  return (
    <div className="min-h-screen bg-[#020202] p-8 md:p-16 flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
              <Lock className="w-8 h-8 text-blue-500" />
              MY PRIVATE FLOWS
            </h1>
            <p className="text-white/50 font-mono text-sm tracking-widest uppercase">
              Secure Sandbox • Design Partner Mode
            </p>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-all group">
            <Plus className="w-4 h-4 text-blue-400 group-hover:scale-125 transition-transform" />
            New Flow
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {mockPrivateFlows.map((flow, index) => (
            <motion.div
              key={flow.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 hover:border-blue-500/50 transition-all shadow-2xl overflow-hidden"
            >
              {/* Background Glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[100px] pointer-events-none group-hover:bg-blue-500/20 transition-colors" />
              
              <div className="relative z-10 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                      {flow.name}
                    </h2>
                    <p className="text-xs text-white/40 font-mono">
                      Created {new Date(flow.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold text-white/60 tracking-widest">
                    {flow.status}
                  </div>
                </div>

                <p className="text-white/60 text-sm leading-relaxed max-w-md">
                  {flow.description}
                </p>

                <div className="flex items-center gap-8 py-2">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-xs font-bold text-white/80">
                      {flow.roles.length} Roles
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-5 h-5 rounded-full bg-blue-500 border-2 border-[#0a0a0a]" />
                      ))}
                      <div className="w-5 h-5 rounded-full bg-white/10 border-2 border-[#0a0a0a] flex items-center justify-center text-[8px] text-white/60">
                        +{flow.roles.length - 3}
                      </div>
                    </div>
                    <span className="text-xs text-white/40">
                      {flow.roles.filter(r => r.status !== 'GAP').length} filled • {flow.roles.filter(r => r.status === 'GAP').length} gaps
                    </span>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    onClick={() => onOpenFlow(flow.id)}
                    className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white text-black transition-all flex items-center justify-center gap-2 group/btn"
                  >
                    Open Canvas
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
