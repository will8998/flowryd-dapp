"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ShieldCheck, Zap, ArrowRight, Building2, Database, Network, Layers, Sparkles, Plus, Users, Eye, X, Star, AlertTriangle } from 'lucide-react';
import { participants } from '@/lib/canton-data';
import { LiquidGlass } from './LiquidPrimitives';

interface Stack {
  id: string;
  name: string;
  desc: string;
  partners: string[];
  fee: string;
  nodes: Array<{
    role: string;
    participantId: string;
    position: { x: number; y: number };
  }>;
}

interface NetworkGridProps {
  onSelectStack: (stack: Stack) => void;
}

type ViewState = 'welcome' | 'browsing' | 'filtered';

export const NetworkGrid: React.FC<NetworkGridProps> = ({ onSelectStack }) => {
  const [filter, setFilter] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [viewState, setViewState] = useState<ViewState>('welcome');

  // Determine view state based on user interactions
  const currentViewState = useMemo<ViewState>(() => {
    if (filter.trim() || selectedRole !== 'ALL') return 'filtered';
    if (viewState === 'browsing') return 'browsing';
    return 'welcome';
  }, [filter, selectedRole, viewState]);

  const filteredParticipants = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(filter.toLowerCase()) || 
                         p.cantonRole.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || p.cantonRole.toUpperCase().includes(selectedRole);
    return matchesSearch && matchesRole;
  });

  // Group participants by role for browsing mode
  const groupedParticipants = useMemo(() => {
    const groups = new Map<string, typeof participants>();
    filteredParticipants.forEach(p => {
      const role = p.cantonRole;
      if (!groups.has(role)) groups.set(role, []);
      groups.get(role)!.push(p);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [filteredParticipants]);

  const ROLES = ['ALL', 'REGISTRY', 'ISSUER', 'CUSTODY', 'EXCHANGE', 'LIQUIDITY', 'COMPLIANCE'];

  // Role count mapping
  const roleCounts = useMemo(() => {
    const counts = new Map<string, number>();
    ROLES.forEach(role => {
      if (role === 'ALL') {
        counts.set(role, participants.length);
      } else {
        counts.set(role, participants.filter(p => p.cantonRole.toUpperCase().includes(role)).length);
      }
    });
    return counts;
  }, []);

  const FEATURED_STACKS = [
    {
      id: 'stack_tokenization',
      name: 'Tokenized Asset Stack',
      desc: 'Complete issuer-to-custody workflow for digital asset creation and management.',
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
      desc: 'Institutional collateral mobility and lending infrastructure.',
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
      desc: 'KYC/AML compliance suite for seamless customer onboarding.',
      partners: ['C7 Identity', 'Memora', 'IntellectEU'],
      fee: '3%',
      nodes: [
        { role: 'Identity', participantId: 'p5', position: { x: 0, y: -100 } },
        { role: 'Storage', participantId: 'p8', position: { x: -150, y: 100 } },
        { role: 'Infra', participantId: 'p9', position: { x: 150, y: 100 } }
      ]
    }
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
    if (e.target.value.trim() && viewState === 'welcome') {
      setViewState('browsing');
    }
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
    if (viewState === 'welcome') {
      setViewState('browsing');
    }
  };

  const handleExploreClick = () => {
    setViewState('browsing');
  };

  const clearFilters = () => {
    setFilter('');
    setSelectedRole('ALL');
    setViewState('welcome');
  };

  const renderParticipantCard = (p: typeof participants[0], index: number) => (
    <motion.div
      key={p.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-[#0a0a0a] border rounded-[24px] p-5 hover:border-blue-500/30 hover:bg-white/[0.01] transition-all group relative overflow-hidden cursor-pointer ${
        p.criticality === 'CRITICAL' ? 'border-amber-500/20 border-l-amber-500/60 border-l-2' : 'border-white/10'
      }`}
    >
      {p.criticality === 'CRITICAL' && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_#f59e0b] animate-pulse" title="Critical Participant" />
        </div>
      )}
      
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
        <h3 className="text-sm font-bold font-sans uppercase tracking-tighter text-white group-hover:text-blue-400 transition-colors truncate">{p.name}</h3>
        <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest font-bold truncate">{p.cantonRole}</p>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
         <span className="text-[9px] text-white/40 font-mono">{p.validatorNodes ? `${p.validatorNodes} Nodes` : 'Hosted'}</span>
         <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-[#020202] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Welcome State - Hero with Featured Stacks */}
        {currentViewState === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10">
              <div className="flex justify-between items-center">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold font-sans uppercase tracking-tighter text-blue-500">Discover Network</h1>
                  <p className="text-white/60 text-sm font-mono">Choose a ready-made workflow template or explore individual participants</p>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    value={filter}
                    onChange={handleSearchChange}
                    placeholder="Search participants..."
                    className="w-80 bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-mono placeholder-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto space-y-12">
                {/* Featured Stacks - Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold font-sans uppercase tracking-tighter text-white">Featured Workflow Templates</h2>
                    <p className="text-white/40 text-sm font-mono">Pre-configured participant stacks for common use cases</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {FEATURED_STACKS.map((stack, index) => (
                      <motion.button
                        key={stack.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => onSelectStack(stack)}
                        className="text-left group h-full"
                      >
                        <LiquidGlass className="p-6 border-blue-500/10 hover:border-blue-500/40 bg-blue-500/5 hover:bg-blue-500/10 transition-all h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all group-hover:scale-110">
                               <Plus className="w-4 h-4" />
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold font-sans uppercase text-white group-hover:text-blue-400 transition-colors mb-2">{stack.name}</h3>
                          <p className="text-sm text-white/60 mb-4 leading-relaxed">{stack.desc}</p>
                          
                          <div className="space-y-3">
                            <div className="flex -space-x-2">
                               {stack.partners.slice(0, 4).map((p, i) => (
                                  <div key={i} className="w-8 h-8 rounded-full bg-black border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white/60 group-hover:border-blue-500/30 transition-colors" title={p}>
                                     {p.charAt(0)}
                                  </div>
                               ))}
                               {stack.partners.length > 4 && (
                                 <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                   +{stack.partners.length - 4}
                                 </div>
                               )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-blue-500/80 uppercase tracking-widest">{stack.fee} network fee</span>
                              <div className="flex items-center gap-2 text-white/40 group-hover:text-blue-400 transition-colors">
                                <span className="text-xs font-mono">{stack.nodes.length} participants</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </LiquidGlass>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Explore CTA */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-center"
                >
                  <button
                    onClick={handleExploreClick}
                    className="group inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-blue-500/30 rounded-xl transition-all"
                  >
                    <Eye className="w-4 h-4 text-white/40 group-hover:text-blue-400 transition-colors" />
                    <span className="text-sm font-mono text-white/60 group-hover:text-white transition-colors">Explore All {participants.length} Participants</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                  </button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Browsing/Filtered State */}
        {(currentViewState === 'browsing' || currentViewState === 'filtered') && (
          <motion.div
            key="browsing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full flex flex-col"
          >
            {/* Header with Search and Filters */}
            <div className="px-8 pt-8 pb-6 border-b border-white/5 bg-black/20 backdrop-blur-md z-10 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold font-sans uppercase tracking-tighter text-blue-500">Network Participants</h2>
                  <p className="text-white/40 text-xs font-mono">
                    {currentViewState === 'filtered' 
                      ? `Showing ${filteredParticipants.length} of ${participants.length} participants`
                      : `${participants.length} verified network participants`
                    }
                  </p>
                </div>
                
                <div className="flex gap-4 items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                    <input 
                      type="text"
                      value={filter}
                      onChange={handleSearchChange}
                      placeholder="Search participants..."
                      className="w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-blue-500/50 transition-all font-mono"
                    />
                  </div>

                  {(filter || selectedRole !== 'ALL') && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/30 rounded-xl transition-all text-xs font-mono text-white/60 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Role Filters */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex gap-2 overflow-x-auto no-scrollbar"
              >
                {ROLES.map(role => (
                  <button
                    key={role}
                    onClick={() => handleRoleSelect(role)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest transition-all whitespace-nowrap ${
                      selectedRole === role 
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' 
                        : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10 border border-white/10'
                    }`}
                  >
                    {role}
                    <span className={`px-1.5 py-0.5 rounded text-[8px] ${
                      selectedRole === role ? 'bg-white/20' : 'bg-white/10'
                    }`}>
                      {roleCounts.get(role) || 0}
                    </span>
                  </button>
                ))}
              </motion.div>
            </div>

            {/* Participants Grid */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <AnimatePresence mode="wait">
                {currentViewState === 'browsing' && selectedRole === 'ALL' ? (
                  // Grouped by role
                  <motion.div
                    key="grouped"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-8"
                  >
                    {groupedParticipants.map(([role, roleParticipants], groupIndex) => (
                      <motion.div
                        key={role}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.1 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-bold font-sans uppercase tracking-widest text-white/80">{role}</h3>
                          <div className="h-px bg-white/10 flex-1" />
                          <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">{roleParticipants.length} participants</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {roleParticipants.map((p, index) => renderParticipantCard(p, index))}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  // Flat grid for filtered results
                  <motion.div
                    key="flat"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                  >
                    {filteredParticipants.map((p, index) => renderParticipantCard(p, index))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
