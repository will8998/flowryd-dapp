'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MousePointer2, 
  UserCheck, 
  Wallet, 
  LineChart, 
  Building2,
  CheckCircle2, 
  ArrowRight,
  Zap,
  Layers,
  MessageSquare,
  Lock,
  Shield,
  ShieldCheck,
  Send
} from 'lucide-react';
import { cn } from '../lib/utils';

type Phase = 'marketplace' | 'review' | 'negotiation' | 'launching' | 'success';

const APPS = [
  { id: 'c7', name: 'Identity', icon: UserCheck, color: 'text-indigo-400', bg: 'bg-indigo-500/10', border: 'border-indigo-500/50', glow: 'shadow-[0_0_15px_-3px_rgba(99,102,241,0.4)]' },
  { id: 'kaiko', name: 'Data Oracle', icon: LineChart, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/50', glow: 'shadow-[0_0_15px_-3px_rgba(236,72,153,0.4)]' },
  { id: '7ridge', name: 'DEX', icon: Building2, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/50', glow: 'shadow-[0_0_15px_-3px_rgba(245,158,11,0.4)]' },
  { id: 'canton', name: 'Wallet', icon: Wallet, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50', glow: 'shadow-[0_0_15px_-3px_rgba(16,185,129,0.4)]' },
];

export default function DemoSequence() {
  const [phase, setPhase] = useState<Phase>('marketplace');
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [cursorState, setCursorState] = useState({ x: '110%', y: '110%', active: false, visible: false });
  
  useEffect(() => {
    let mounted = true;
    const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const moveCursor = async (x: string, y: string, click = false) => {
      if (!mounted) return;
      setCursorState(prev => ({ ...prev, x, y, active: false }));
      await wait(800);
      if (click) {
        if (!mounted) return;
        setCursorState(prev => ({ ...prev, active: true }));
        await wait(200);
        if (!mounted) return;
        setCursorState(prev => ({ ...prev, active: false }));
        await wait(200);
      }
    };

    const runSequence = async () => {
      if (!mounted) return;

      setPhase('marketplace');
      setSelectedApps([]);
      setCursorState({ x: '110%', y: '110%', active: false, visible: false });
      
      await wait(1000);
      if (!mounted) return;
      setCursorState(prev => ({ ...prev, visible: true }));

      await moveCursor('25%', '25%', true);
      if (!mounted) return;
      setSelectedApps(prev => [...prev, 'c7']);

      await moveCursor('75%', '25%', true);
      if (!mounted) return;
      setSelectedApps(prev => [...prev, 'kaiko']);

      await moveCursor('75%', '75%', true);
      if (!mounted) return;
      setSelectedApps(prev => [...prev, 'canton']);

      await moveCursor('50%', '90%', true);
      if (!mounted) return;

      setPhase('review');
      await wait(1000);

      await moveCursor('50%', '85%', true);
      if (!mounted) return;

      setPhase('negotiation');
      await wait(5500);
      
      if (!mounted) return;
      setPhase('launching');
      await wait(1500); 
      
      if (!mounted) return;
      setPhase('success');

      setCursorState(prev => ({ ...prev, x: '110%', y: '110%' }));

      await wait(4000);
      
      runSequence();
    };

    runSequence();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="w-full h-[450px] bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden relative font-sans select-none shadow-2xl group">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="relative z-10 w-full h-full flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-2">
            <div className={cn("w-2 h-2 rounded-full transition-colors duration-500", 
              phase === 'success' ? "bg-emerald-500 animate-pulse" : 
              phase === 'launching' ? "bg-amber-500 animate-pulse" : "bg-zinc-700"
            )}></div>
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider">Flowryd Protocol</span>
          </div>
          <div className="text-[10px] text-zinc-600 font-mono">
            {phase === 'marketplace' && 'SELECT_MODULES'}
            {phase === 'review' && 'VERIFY_STACK'}
            {phase === 'negotiation' && 'SECURE_CHANNEL'}
            {phase === 'launching' && 'EXECUTING...'}
            {phase === 'success' && 'SETTLEMENT_CONFIRMED'}
          </div>
        </div>

        <div className="flex-1 relative p-6 flex flex-col">
          <AnimatePresence mode="wait">
            {phase === 'marketplace' && (
              <MarketplaceView key="marketplace" selected={selectedApps} />
            )}
            {phase === 'review' && (
              <ReviewStackView key="review" selectedIds={selectedApps} />
            )}
            {(phase === 'negotiation' || phase === 'launching') && (
              <NegotiationView key="negotiation" isLaunching={phase === 'launching'} />
            )}
            {phase === 'success' && (
              <SuccessView key="success" />
            )}
          </AnimatePresence>
        </div>
      </div>

      <Cursor x={cursorState.x} y={cursorState.y} active={cursorState.active} visible={cursorState.visible} />
    </div>
  );
}

function MarketplaceView({ selected }: { selected: string[] }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }}
      className="h-full flex flex-col"
    >
      <div className="grid grid-cols-2 gap-4 flex-1">
        {APPS.map((app) => {
          const isSelected = selected.includes(app.id);
          return (
            <div 
              key={app.id}
              className={cn(
                "relative flex flex-col p-4 rounded-xl border transition-all duration-300 overflow-hidden",
                isSelected 
                  ? cn("bg-zinc-900", app.border, app.glow) 
                  : "bg-zinc-900/30 border-zinc-800/50 hover:border-zinc-700"
              )}
            >
              <div className="flex justify-between items-start mb-3">
                <div className={cn("p-2 rounded-lg bg-zinc-950 border border-zinc-800", app.color)}>
                  <app.icon className="w-5 h-5" />
                </div>
                <div className={cn(
                  "w-5 h-5 rounded-full border flex items-center justify-center transition-colors duration-300",
                  isSelected ? cn("bg-zinc-950", app.border) : "border-zinc-800"
                )}>
                  {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className={cn("w-2.5 h-2.5 rounded-full", app.bg.replace('/10', ''))} />}
                </div>
              </div>
              <h3 className="text-sm font-medium text-zinc-200">{app.name}</h3>
              <p className="text-[10px] text-zinc-500 mt-1">v2.4.0 • Verified</p>
              
              {isSelected && (
                <motion.div 
                  layoutId="selection-highlight"
                  className={cn("absolute inset-0 opacity-10 pointer-events-none", app.bg)}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex justify-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: selected.length > 0 ? 0 : 20, opacity: selected.length > 0 ? 1 : 0 }}
          className="bg-zinc-100 text-zinc-950 px-6 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
        >
          <Layers className="w-3 h-3" />
          CREATE STACK ({selected.length})
        </motion.div>
      </div>
    </motion.div>
  );
}

function ReviewStackView({ selectedIds }: { selectedIds: string[] }) {
  const selectedApps = APPS.filter(a => selectedIds.includes(a.id));

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, x: -50 }}
      className="h-full flex flex-col items-center justify-center"
    >
      <div className="relative flex items-center justify-center w-full gap-2 mb-12">
        <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-zinc-800 -z-10" />
        
        {selectedApps.map((app, i) => (
          <React.Fragment key={app.id}>
            <motion.div 
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={cn(
                "relative w-20 h-24 rounded-lg bg-zinc-900 border flex flex-col items-center justify-center gap-2 shadow-xl z-10",
                app.border
              )}
            >
              <app.icon className={cn("w-6 h-6", app.color)} />
              <div className="text-[9px] font-medium text-zinc-400 text-center px-1">{app.name}</div>
              
              {i < selectedApps.length - 1 && (
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  className="absolute top-1/2 left-full w-8 h-0.5 bg-zinc-700" 
                />
              )}
            </motion.div>
            
            {i < selectedApps.length - 1 && (
               <div className="w-8 flex items-center justify-center z-0">
                 <ArrowRight className="w-4 h-4 text-zinc-700" />
               </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="w-full max-w-[200px]"
      >
        <button className={cn(
          "w-full py-3 rounded-lg flex items-center justify-center gap-2 text-xs font-bold tracking-wider transition-all duration-300",
          "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-cyan-500/20"
        )}>
            <MessageSquare className="w-3 h-3 fill-white" />
            START NEGOTIATION
        </button>
      </motion.div>
    </motion.div>
  );
}

function NegotiationView({ isLaunching }: { isLaunching: boolean }) {
  const [messages, setMessages] = useState<Array<{id: number, type: 'system' | 'user' | 'counterparty', text: string}>>([]);

  useEffect(() => {
    const sequence: Array<{id: number, type: 'system' | 'user' | 'counterparty', text: string}> = [
      { id: 1, type: 'system', text: "Secure Channel Established [E2EE]" },
      { id: 2, type: 'user', text: "Proposing settlement: T+0, 145 $CC" },
      { id: 3, type: 'counterparty', text: "Terms Accepted. Committing..." },
      { id: 4, type: 'system', text: "Consensus Reached" }
    ];

    let timeouts: NodeJS.Timeout[] = [];
    setMessages([]);

    sequence.forEach((msg, index) => {
      const delay = index === 0 ? 100 : index * 1200 + 500;
      const timeout = setTimeout(() => {
        setMessages(prev => {
             if (prev.find(m => m.id === msg.id)) return prev;
             return [...prev, msg];
        });
      }, delay);
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col max-w-lg mx-auto w-full relative"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/10 to-zinc-950/20 pointer-events-none" />
      
      <div className="flex-1 space-y-4 overflow-y-auto p-4 custom-scrollbar">
        {messages.map((msg) => (
           <motion.div
             key={msg.id}
             initial={{ opacity: 0, x: msg.type === 'user' ? 20 : -20, scale: 0.95 }}
             animate={{ opacity: 1, x: 0, scale: 1 }}
             transition={{ type: "spring", stiffness: 200, damping: 20 }}
             className={cn(
               "flex w-full",
               msg.type === 'user' ? "justify-end" : "justify-start"
             )}
           >
             <div className={cn(
               "max-w-[80%] rounded-lg p-3 text-xs border backdrop-blur-sm relative overflow-hidden",
               msg.type === 'system' ? "w-full text-center bg-transparent border-none text-zinc-500 font-mono my-2" : "shadow-lg",
               msg.type === 'user' ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-200 rounded-br-none" : "",
               msg.type === 'counterparty' ? "bg-zinc-800/80 border-zinc-700 text-zinc-300 rounded-bl-none" : ""
             )}>
                {msg.type !== 'system' && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase tracking-wider font-mono">
                      {msg.type === 'user' ? <ShieldCheck className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                      {msg.type === 'user' ? 'You' : 'Counterparty'}
                    </div>
                  </>
                )}
                {msg.type === 'system' && (
                   <div className="flex items-center justify-center gap-2">
                     <div className="h-px bg-zinc-800 w-12" />
                     <span>{msg.text}</span>
                     <div className="h-px bg-zinc-800 w-12" />
                   </div>
                )}
                {msg.type !== 'system' && msg.text}
             </div>
           </motion.div>
        ))}
        {isLaunching && (
           <motion.div
             initial={{ opacity: 0 }}
             animate={{ opacity: 1 }}
             className="flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono mt-6 bg-emerald-500/5 py-2 rounded-lg border border-emerald-500/20"
           >
             <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
             EXECUTING ON LEDGER...
           </motion.div>
        )}
      </div>
      
      <div className="mt-2 p-3 border-t border-zinc-800/50 bg-zinc-950/30 backdrop-blur-md rounded-b-xl">
        <div className="flex gap-3 items-center opacity-50 pointer-events-none">
            <div className="flex-1 bg-zinc-900/50 h-9 rounded-md border border-zinc-800/50 px-3 flex items-center text-xs text-zinc-600">
               Type a message...
            </div>
            <div className="w-9 h-9 bg-zinc-800 rounded-md flex items-center justify-center text-zinc-600 border border-zinc-700/50">
               <Send className="w-4 h-4" />
            </div>
        </div>
      </div>
    </motion.div>
  );
}

function SuccessView() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full flex flex-col items-center justify-center"
    >
      <div className="w-full max-w-sm bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
        
        <div className="flex flex-col items-center text-center mb-6">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 15 }}
            className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 text-emerald-500"
          >
            <CheckCircle2 className="w-8 h-8" />
          </motion.div>
          <h2 className="text-lg font-semibold text-white">Transaction Complete</h2>
          <p className="text-xs text-zinc-500 mt-1">Block #19,204,992</p>
        </div>

        <div className="space-y-3 bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Status</span>
            <span className="text-emerald-400 font-medium">Finalized</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Network Fee</span>
            <span className="text-zinc-300 font-mono">0.0042 $CC</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-zinc-500">Gas Used</span>
            <span className="text-zinc-300 font-mono">21,000</span>
          </div>
          <div className="h-px bg-zinc-800 my-2" />
          <div className="flex justify-between text-xs">
            <span className="text-zinc-400">Total Settlement</span>
            <span className="text-emerald-400 font-mono font-bold">145.00 $CC</span>
          </div>
        </div>

        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 4, ease: "linear" }}
          className="absolute bottom-0 left-0 h-0.5 bg-zinc-800"
        />
      </div>
    </motion.div>
  );
}

function Cursor({ x, y, active, visible }: { x: string, y: string, active: boolean, visible: boolean }) {
  if (!visible) return null;

  return (
    <motion.div
      className="absolute z-50 pointer-events-none"
      initial={false}
      animate={{ x, y }}
      transition={{
        type: "spring",
        stiffness: 150,
        damping: 25,
        mass: 0.8
      }}
    >
      <motion.div
        animate={{ scale: active ? 0.8 : 1 }}
        className="relative"
      >
        <MousePointer2 className="w-5 h-5 text-white fill-black drop-shadow-xl" />
        
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-[-10px] left-[-10px] w-10 h-10 rounded-full bg-white/30"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
