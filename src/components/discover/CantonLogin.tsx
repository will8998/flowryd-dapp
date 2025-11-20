"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, ArrowRight, CheckCircle2, Loader2, Server } from 'lucide-react';

interface CantonLoginProps {
  onComplete: () => void;
}

const TERMINAL_STEPS = [
  { text: "Connecting to Ledger API...", delay: 800 },
  { text: "Authenticating Canton Party ID...", delay: 1500 },
  { text: "Querying ACS (Active Contract Set)...", delay: 2400 },
  { text: "Retrieving topology transactions...", delay: 3200 },
  { text: "3 Holdings found. Validator status: Active.", delay: 4000, success: true }
];

export const CantonLogin: React.FC<CantonLoginProps> = ({ onComplete }) => {
  const [partyId, setPartyId] = useState('');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'complete'>('idle');
  const [logs, setLogs] = useState<Array<{ text: string, success?: boolean }>>([]);

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) return;
    
    setStatus('connecting');
    
    // Simulate terminal sequence
    let currentStep = 0;
    
    const runStep = () => {
      if (currentStep >= TERMINAL_STEPS.length) {
        setTimeout(() => {
          setStatus('complete');
          setTimeout(onComplete, 1000);
        }, 1000);
        return;
      }

      const step = TERMINAL_STEPS[currentStep];
      setLogs(prev => [...prev, { text: step.text, success: step.success }]);
      
      currentStep++;
      if (currentStep < TERMINAL_STEPS.length) {
        setTimeout(runStep, TERMINAL_STEPS[currentStep].delay - (TERMINAL_STEPS[currentStep - 1]?.delay || 0));
      } else {
        setTimeout(() => {
          setStatus('complete');
          setTimeout(onComplete, 800);
        }, 1000);
      }
    };

    // Start first step
    setTimeout(runStep, 500);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[#050505] font-mono overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ 
             backgroundImage: 'linear-gradient(#333 1px, transparent 1px), linear-gradient(90deg, #333 1px, transparent 1px)', 
             backgroundSize: '40px 40px'
           }} 
      />

      <div className="max-w-md w-full z-10">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 mb-6">
            <Server className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Connect Node</h1>
          <p className="text-white/40 text-sm">Enter your Canton Party ID to visualize your network position.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {status === 'idle' ? (
            <motion.form 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              onSubmit={handleConnect}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Terminal className="h-4 w-4 text-white/30" />
                </div>
                <input
                  type="text"
                  value={partyId}
                  onChange={(e) => setPartyId(e.target.value)}
                  placeholder="participant::1234..."
                  className="w-full bg-[#111] border border-white/10 rounded-lg py-4 pl-11 pr-4 text-white placeholder:text-white/20 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-all font-mono text-sm"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={!partyId}
                className="w-full py-4 bg-white text-black font-bold rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                Connect to Ledger <ArrowRight className="w-4 h-4" />
              </button>
              
              <div className="pt-8 border-t border-white/5 mt-8">
                <p className="text-xs text-white/30">
                  Don't have a node? <span className="text-white/50 underline cursor-pointer hover:text-white">Use simulated environment</span>
                </p>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="terminal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black border border-white/10 rounded-xl p-6 text-left shadow-2xl font-mono text-xs relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 animate-pulse" />
              <div className="space-y-3 min-h-[160px]">
                {logs.map((log, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex items-center gap-3 ${log.success ? 'text-green-400' : 'text-white/70'}`}
                  >
                    {log.success ? <CheckCircle2 className="w-3 h-3" /> : <span className="w-3 h-3 text-blue-500">›</span>}
                    {log.text}
                  </motion.div>
                ))}
                {status === 'connecting' && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 text-blue-400"
                  >
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span className="animate-pulse">_</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

