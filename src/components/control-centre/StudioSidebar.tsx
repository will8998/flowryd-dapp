"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Globe, 
  Layers, 
  Zap, 
  Users, 
  Terminal, 
  Settings, 
  Bell, 
  Search,
  LayoutDashboard,
  Workflow,
  Plus,
  Shield,
  Activity,
  LogOut,
  ChevronRight,
  Command,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import Image from 'next/image';

interface StudioSidebarProps {
  activeTier: string;
  onTierChange: (tier: any) => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({ activeTier, onTierChange }) => {
  const { partyId, disconnect } = useCantonAuth();
  
  const MENU_ITEMS = [
    { id: 'DISCOVER', label: 'Discover', icon: Globe, tier: 'DISCOVER' },
    { id: 'NAVIGATE', label: 'Workbench', icon: Layers, tier: 'NAVIGATE' },
    { id: 'ACTIVATE', label: 'Deals', icon: MessageSquare, tier: 'ACTIVATE' },
  ];

  const SECONDARY_ITEMS = [
    { id: 'JOIN', label: 'Collective Hub', icon: Users, tier: 'JOIN' },
    { label: 'Intelligence', icon: Terminal, href: '#' },
    { label: 'App Stacks', icon: Workflow, href: '#' },
  ];

  const ACTIVE_DEALS = ['Repo_Sync_Room', 'Bond_Issuance_v1'];

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-white/5 flex flex-col z-50">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/flowrydlogo.svg" alt="Flowryd" width={100} height={24} className="h-5 w-auto" />
          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[8px] font-black tracking-widest rounded-full border border-blue-500/20">V1.2</span>
        </div>
      </div>

      <div className="flex-1 p-4 space-y-8 overflow-y-auto">
        <div className="space-y-1">
          <p className="px-4 text-[8px] font-bold text-white/20 uppercase tracking-widest mb-4">Core</p>
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTierChange(item.tier)}
              className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all group ${
                activeTier === item.tier ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className={`w-4 h-4 ${activeTier === item.tier ? 'text-white' : 'text-blue-500'}`} />
                <span className="text-xs font-bold tracking-wide uppercase">{item.label}</span>
              </div>
              {activeTier === item.tier && <ChevronRight className="w-4 h-4 opacity-50" />}
            </button>
          ))}
        </div>

        <div className="space-y-1">
          <p className="px-4 text-[8px] font-bold text-white/20 uppercase tracking-widest mb-4">Ecosystem</p>
          <AnimatePresence mode="wait">
            {activeTier === 'ACTIVATE' ? (
              <motion.div 
                key="deals"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-2 px-2"
              >
                  <p className="px-2 text-[8px] font-bold text-emerald-500/60 uppercase tracking-widest mb-2">Conversations</p>
                 {ACTIVE_DEALS.map(room => (
                   <button key={room} className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 text-left hover:border-emerald-500/50 transition-all group">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">{room}</span>
                   </button>
                 ))}
              </motion.div>
            ) : (
              <motion.div 
                key="secondary"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {SECONDARY_ITEMS.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => item.tier && onTierChange(item.tier)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all group ${
                      activeTier === item.tier ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20' : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${activeTier === item.tier ? 'text-white' : 'group-hover:text-emerald-500 transition-colors'}`} />
                    <span className="text-xs font-bold tracking-wide uppercase">{item.label}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-6 bg-black border-t border-white/5 space-y-4">
        <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-xs font-bold font-sans">
            {partyId?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-white leading-none mb-1">Canton Node</p>
            <p className="text-[10px] font-mono text-white/40 truncate uppercase">{partyId?.split('::')[1] || 'TEXTURE::1234'}</p>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
           <button className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-white/40 hover:text-white">
             <Settings className="w-4 h-4" />
           </button>
           <button 
             onClick={disconnect}
             className="flex items-center justify-center p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-red-500/10 hover:border-red-500/50 hover:text-red-500 transition-all text-white/40"
           >
             <LogOut className="w-4 h-4" />
           </button>
        </div>
      </div>
    </div>
  );
};
