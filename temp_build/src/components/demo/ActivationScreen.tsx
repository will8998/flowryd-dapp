"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Zap, BarChart3, Shield, Globe } from 'lucide-react';

interface ActivationScreenProps {
  onBack: () => void;
}

export const ActivationScreen: React.FC<ActivationScreenProps> = ({ onBack }) => {
  const [isActivated, setIsActivated] = useState(false);

  const participants = [
    { name: 'Treasury Co.', role: 'Issuer', share: '15%' },
    { name: 'Texture', role: 'Broker-Dealer', share: '25%' },
    { name: 'Texture', role: 'Transfer Agent', share: '10%' },
    { name: 'Texture', role: 'ATS Operator', share: '10%' },
    { name: 'BitGo', role: 'Crypto Custodian', share: '15%' },
    { name: 'Kaiko', role: 'Price Oracle', share: '5%' },
    { name: 'C7 Trust', role: 'Compliance', share: '10%' },
    { name: 'Flowryd', role: 'Orchestration', share: '10%' },
  ];

  const handleActivate = () => {
    setIsActivated(true);
  };

  return (
    <div className="min-h-screen bg-[#020202] flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <AnimatePresence mode="wait">
        {!isActivated ? (
          <motion.div 
            key="summary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-4xl w-full bg-[#0a0a0a] border border-white/10 rounded-[32px] p-12 shadow-2xl relative z-10"
          >
            <div className="flex justify-between items-start mb-12">
              <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft className="w-5 h-5 text-white/50" />
              </button>
              <div className="text-right">
                <span className="px-4 py-1.5 bg-green-500/20 text-green-400 border border-green-500/20 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase">
                  Flow Ready
                </span>
              </div>
            </div>

            <h1 className="text-4xl font-bold mb-4 tracking-tight">DAT Tokenization + Crypto Redemption</h1>
            <p className="text-white/50 text-lg mb-12">All 7 roles filled. Smart contracts synchronized on Canton Network.</p>

            <div className="grid md:grid-cols-2 gap-12 mb-12">
              <div className="space-y-6">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Participants & Shares</h3>
                <div className="space-y-3">
                  {participants.map((p, i) => (
                    <div key={i} className="flex justify-between items-center group">
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">{p.name}</p>
                        <p className="text-[10px] text-white/40">{p.role}</p>
                      </div>
                      <span className="font-mono text-sm text-white/80">{p.share}</span>
                    </div>
                  ))}
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center">
                    <span className="text-sm font-bold text-blue-400">Total Share</span>
                    <span className="font-mono text-sm text-blue-400">100%</span>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest border-b border-white/5 pb-2">Network Projections</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <Zap className="w-3 h-3" />
                      <span className="text-[10px] uppercase">Daily Commits</span>
                    </div>
                    <p className="text-2xl font-mono font-bold tracking-tighter">8,360</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-white/40 mb-1">
                      <BarChart3 className="w-3 h-3" />
                      <span className="text-[10px] uppercase">Efficiency</span>
                    </div>
                    <p className="text-2xl font-mono font-bold tracking-tighter text-green-400">+42%</p>
                  </div>
                </div>

                <div className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-blue-400" />
                    <p className="text-xs font-bold text-white">Institutional Grade Security</p>
                  </div>
                  <p className="text-[11px] text-white/50 leading-relaxed">This flow utilizes Private Canvas deployment protocols. All participant data is encrypted and visible only to signatories.</p>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-white/10">
              <button 
                onClick={handleActivate}
                className="w-full py-6 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-xl transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
              >
                ACTIVATE FLOW ON CANTON
                <ArrowLeft className="w-6 h-6 rotate-180 group-hover:translate-x-2 transition-transform" />
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center space-y-8 relative z-10"
          >
            <div className="relative">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1.2 }}
                className="w-32 h-32 bg-green-500/20 rounded-full blur-3xl absolute -inset-4"
              />
              <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10" />
            </div>
            <div className="space-y-4">
              <h2 className="text-5xl font-bold tracking-tight text-white">Flow Activated</h2>
              <p className="text-xl text-white/50 max-w-lg mx-auto leading-relaxed">Your DAT Tokenization flow is now live on the Canton Network. Rewards have begun accumulating.</p>
            </div>

            <div className="flex gap-4 pt-8">
              <button className="px-8 py-3 bg-white text-black rounded-xl font-bold text-sm hover:bg-blue-50 transition-colors">
                View Explorer
              </button>
              <button onClick={onBack} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                Go to Dashboard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
