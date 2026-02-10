"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, ArrowUpRight, Zap, ShieldCheck, Globe, Cpu } from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import { FlowsStudio } from '@/components/control-centre/FlowsStudio';

export default function Home() {
  const { isConnected, connect } = useCantonAuth();
  const [partyIdInput, setPartyIdInput] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyIdInput) return;
    setIsConnecting(true);
    setTimeout(() => {
      connect(partyIdInput);
      setIsConnecting(false);
    }, 1500);
  };

  if (isConnected) {
    return <FlowsStudio />;
  }

  return (
    <div className="relative min-h-screen text-white bg-[#020202] overflow-hidden selection:bg-blue-500/30 flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full pointer-events-none animate-pulse" />
        <div className="absolute inset-0 opacity-20 pointer-events-none" 
             style={{ 
               backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', 
               backgroundSize: '40px 40px'
             }} 
        />
      </div>

      <div className="relative z-10 w-full max-w-lg px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12 text-center"
        >
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">
              <Zap className="w-3 h-3 text-blue-500" /> Canton Network
            </div>
            <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
              Flowryd <span className="text-blue-600">OS</span>
            </h1>
            <p className="text-lg text-white/40 max-w-sm mx-auto leading-relaxed">
              The orchestration layer for institutional multi-party workflows.
            </p>
          </div>

          <div className="bg-[#0a0a0a]/80 backdrop-blur-2xl border border-white/10 p-2 rounded-[32px] shadow-2xl ring-1 ring-white/5 group hover:ring-blue-500/30 transition-all duration-500">
            <form onSubmit={handleConnect} className="relative flex items-center">
              <div className="absolute left-6 text-white/20 group-focus-within:text-blue-500 transition-colors">
                <Terminal className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={partyIdInput}
                onChange={(e) => setPartyIdInput(e.target.value)}
                placeholder="Enter Party ID (e.g. texture::1234)" 
                className="w-full bg-transparent border-none py-6 pl-14 pr-20 text-sm font-mono text-white placeholder:text-white/20 focus:outline-none focus:ring-0"
                autoFocus
              />
              <div className="absolute right-2">
                <button 
                  disabled={!partyIdInput || isConnecting}
                  className="w-12 h-12 bg-white text-black rounded-[20px] flex items-center justify-center hover:bg-blue-50 hover:scale-105 transition-all disabled:opacity-20 disabled:scale-100 disabled:hover:bg-white"
                >
                  {isConnecting ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </button>
              </div>
            </form>
          </div>

          <div className="flex justify-center gap-12 pt-8 opacity-30">
             <div className="text-center space-y-1">
               <p className="text-xl font-black italic font-mono">25K+</p>
               <p className="text-[9px] uppercase tracking-widest font-bold">Parties</p>
             </div>
             <div className="text-center space-y-1">
               <p className="text-xl font-black italic font-mono">$6T</p>
               <p className="text-[9px] uppercase tracking-widest font-bold">Volume</p>
             </div>
             <div className="text-center space-y-1">
               <p className="text-xl font-black italic font-mono">99.9%</p>
               <p className="text-[9px] uppercase tracking-widest font-bold">Uptime</p>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
