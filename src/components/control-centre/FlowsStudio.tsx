"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Activity, 
  Search,
  Command,
  HelpCircle,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  Users
} from 'lucide-react';
import { StudioSidebar } from './StudioSidebar';
import { NetworkGrid } from './NetworkGrid';
import { NavigateHub } from './NavigateHub';
import { ActivateEngine } from './ActivateEngine';
import { RydAITerminal } from './RydAITerminal';
import { OnboardingWizard } from './OnboardingWizard';
import { CollectiveHub } from './CollectiveHub';

type Tier = 'DISCOVER' | 'NAVIGATE' | 'ACTIVATE' | 'JOIN';

export const FlowsStudio: React.FC = () => {
  const [activeTier, setActiveTier] = useState<Tier>('DISCOVER');
  const [notifications, setNotifications] = useState(2);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem('flowryd_onboarding_seen');
    if (!hasSeen) {
      setShowOnboarding(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    localStorage.setItem('flowryd_onboarding_seen', 'true');
  };

  return (
    <div className="flex h-screen bg-[#020202] text-white overflow-hidden selection:bg-blue-500/30">
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingWizard onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      <StudioSidebar activeTier={activeTier} onTierChange={setActiveTier} />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <header className="h-16 border-b border-white/5 bg-black/20 backdrop-blur-md flex items-center justify-between px-8 z-40">
           <div className="flex items-center gap-8">
             <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
               <span className="text-white/60">Mission Control</span>
               <ChevronRight className="w-3 h-3" />
               <span className="text-blue-500">{activeTier === 'DISCOVER' ? 'Discover Network' : activeTier === 'NAVIGATE' ? 'Build Flow' : activeTier === 'ACTIVATE' ? 'Finalise Deals' : 'Collective'}</span>
             </div>

             <div className="h-4 w-px bg-white/5" />

             <div className="flex gap-4">
               {[
                 { id: 'DISCOVER', step: 1, label: '1. Discover Network' },
                 { id: 'NAVIGATE', step: 2, label: '2. Build Flow' },
                 { id: 'ACTIVATE', step: 3, label: '3. Finalise Deals' }
               ].map(t => (
                 <div key={t.id} className="flex items-center gap-2">
                   <div className={`w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold font-mono transition-all ${
                     activeTier === t.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 
                     (t.step < (activeTier === 'DISCOVER' ? 1 : activeTier === 'NAVIGATE' ? 2 : activeTier === 'ACTIVATE' ? 3 : 4) ? 'bg-emerald-500/20 text-emerald-500' : 'bg-white/5 text-white/20')
                   }`}>
                     {t.step < (activeTier === 'DISCOVER' ? 1 : activeTier === 'NAVIGATE' ? 2 : activeTier === 'ACTIVATE' ? 3 : 4) ? <CheckCircle2 className="w-3 h-3" /> : t.step}
                   </div>
                   <span className={`text-[9px] font-bold uppercase tracking-widest ${activeTier === t.id ? 'text-white' : 'text-white/20'}`}>{t.label}</span>
                 </div>
               ))}
             </div>
           </div>

           <div className="flex items-center gap-6">
             <div className="relative group hidden md:block">
               <Command className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
               <input 
                 type="text" 
                 placeholder="Command Palette (⌘K)" 
                 className="bg-white/5 border border-white/10 rounded-full py-2 pl-9 pr-4 text-[10px] w-64 focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                 readOnly
               />
             </div>

             <div className="flex items-center gap-2">
               <button className="p-2 text-white/40 hover:text-white transition-colors relative">
                 <Bell className="w-4 h-4" />
                 {notifications > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />}
               </button>
               <button className="p-2 text-white/40 hover:text-white transition-colors">
                 <HelpCircle className="w-4 h-4" />
               </button>
             </div>
           </div>
        </header>

        <main className="flex-1 relative overflow-hidden flex">
          <div className="flex-1 overflow-y-auto custom-scrollbar relative">
            <AnimatePresence mode="wait">
              {activeTier === 'DISCOVER' && <NetworkGrid key="discover" onSelectStack={(stack) => { console.log(stack); setActiveTier('NAVIGATE'); }} />}
              {activeTier === 'NAVIGATE' && <NavigateHub key="navigate" />}
              {activeTier === 'ACTIVATE' && <ActivateEngine key="activate" />}
              {activeTier === 'JOIN' && <CollectiveHub key="collective" />}
            </AnimatePresence>
          </div>

          <RydAITerminal tier={activeTier} />
        </main>
      </div>
    </div>
  );
};

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);
