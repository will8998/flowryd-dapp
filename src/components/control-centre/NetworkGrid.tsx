"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Building2, Database, Network, Layers, Plus, Users, Eye, X, Star } from 'lucide-react';
import { participants } from '@/lib/canton-data';


interface JumpCut {
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

interface CommunityFlow {
  id: string;
  title: string;
  description: string;
  status: string;
  creatorId: string;
  orgId: string;
  createdAt: string;
  participants: Array<{
    role: string;
    partyId: string | null;
  }>;
}

interface NetworkGridProps {
  onSelectJumpCut: (jumpCut: JumpCut) => void;
}

type ViewState = 'welcome' | 'browsing' | 'filtered';

export const NetworkGrid: React.FC<NetworkGridProps> = ({ onSelectJumpCut }) => {
  const [filter, setFilter] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [viewState, setViewState] = useState<ViewState>('welcome');
  const [communityFlows, setCommunityFlows] = useState<CommunityFlow[]>([]);
  const [joiningFlows, setJoiningFlows] = useState<Set<string>>(new Set());
  const [joinedFlows, setJoinedFlows] = useState<Set<string>>(new Set());

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const FEATURED_JUMP_CUTS = [
    {
      id: 'jc_tokenization',
      name: 'Tokenized Asset Flow',
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
      id: 'jc_repo',
      name: 'Verified Repo Flow',
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
      id: 'jc_onboard',
      name: 'Onboarding Flow',
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

  useEffect(() => {
    const fetchCommunityFlows = async () => {
      try {
        const response = await fetch('/api/flows/public');
        if (response.ok) {
          const { data } = await response.json();
          setCommunityFlows(data || []);
        }
      } catch (error) {
        console.error('Failed to fetch community flows:', error);
      }
    };

    if (viewState === 'browsing') {
      fetchCommunityFlows();
    }
  }, [viewState]);

  const handleJoinFlow = async (flowId: string) => {
    if (joiningFlows.has(flowId) || joinedFlows.has(flowId)) return;
    
    setJoiningFlows(prev => new Set([...prev, flowId]));
    try {
      const response = await fetch(`/api/flows/${flowId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Requesting to join' })
      });
      
      if (response.ok) {
        setJoinedFlows(prev => new Set([...prev, flowId]));
      }
    } catch (error) {
      console.error('Failed to join flow:', error);
    } finally {
      setJoiningFlows(prev => {
        const newSet = new Set(prev);
        newSet.delete(flowId);
        return newSet;
      });
    }
  };

  const renderParticipantCard = (p: typeof participants[0], index: number) => (
    <motion.div
      key={p.id}
      initial={index < 12 ? { opacity: 0, y: 20 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={index < 12 ? { delay: index * 0.03, duration: 0.2 } : { duration: 0 }}
      className={`bg-black/30 border rounded p-5 hover:border-white/30 hover:bg-white/[0.01] transition-all group relative overflow-hidden cursor-pointer ${
        p.criticality === 'CRITICAL' ? 'border-white/20 border-l-white/40 border-l-2' : 'border-white/10'
      }`}
    >
      {p.criticality === 'CRITICAL' && (
        <div className="absolute top-3 right-3">
          <div className="w-2 h-2 rounded-full bg-white/60 animate-pulse" title="Critical Participant" />
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded flex items-center justify-center group-hover:scale-105 transition-transform">
          {p.name.includes('Goldman') || p.name.includes('Bank') ? <Building2 className="w-5 h-5 text-white/70" /> : 
           p.name.includes('DTCC') ? <Database className="w-5 h-5 text-white/70" /> : 
           <Network className="w-5 h-5 text-white/70" />}
        </div>
        <div className="flex gap-1">
           {p.superValidator && (
             <div className="w-2 h-2 rounded-full bg-white/40" title="Super Validator" />
           )}
           <div className="w-2 h-2 rounded-full bg-white/40" title="VP Badge" />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold font-sans tracking-tight text-white group-hover:text-white transition-colors truncate">{p.name}</h3>
        <p className="text-[9px] font-mono text-white/30 tracking-wide font-bold truncate">{p.cantonRole}</p>
      </div>

      <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center opacity-60 group-hover:opacity-100 transition-opacity">
         <span className="text-[9px] text-white/40 font-mono">{p.validatorNodes ? `${p.validatorNodes} Nodes` : 'Hosted'}</span>
         <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-white/70 group-hover:translate-x-1 transition-all" />
      </div>
    </motion.div>
  );

  return (
    <div className="h-full flex flex-col bg-[#020202] overflow-hidden">
      <AnimatePresence mode="wait">
        {/* Welcome State - Hero with Featured Jump Cuts */}
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
                  <h1 className="text-4xl font-bold font-sans tracking-tight text-white">Discover Network</h1>
                  <p className="text-white/60 text-sm font-mono">Choose a ready-made workflow template or explore individual participants</p>
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                  <input 
                    type="text"
                    value={filter}
                    onChange={handleSearchChange}
                    placeholder="Search participants..."
                    className="w-80 bg-white/5 border border-white/10 rounded py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-white/30 transition-all font-mono placeholder-white/30"
                  />
                </div>
              </div>
            </div>

            {/* Hero Content */}
            <div className="flex-1 overflow-y-auto p-8">
              <div className="max-w-7xl mx-auto space-y-12">
                {/* Featured Jump Cuts - Hero Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="space-y-6"
                >
                  <div className="text-center space-y-3">
                    <h2 className="text-2xl font-bold font-sans tracking-tight text-white">Featured Jump Cuts</h2>
                    <p className="text-white/40 text-sm font-mono">Pre-configured participant flows for common use cases</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {FEATURED_JUMP_CUTS.map((jumpCut, index) => (
                      <motion.button
                        key={jumpCut.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => onSelectJumpCut(jumpCut)}
                        className="text-left group h-full"
                      >
                        <div className="p-6 border border-white/10 bg-black/30 rounded hover:border-white/30 transition-all h-full">
                          <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-white/10 rounded text-white/70">
                              <Layers className="w-6 h-6" />
                            </div>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-hover:text-white transition-all group-hover:scale-110">
                               <Plus className="w-4 h-4" />
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-bold font-sans text-white group-hover:text-white transition-colors mb-2">{jumpCut.name}</h3>
                          <p className="text-sm text-white/60 mb-4 leading-relaxed">{jumpCut.desc}</p>
                          
                          <div className="space-y-3">
                            <div className="flex -space-x-2">
                               {jumpCut.partners.slice(0, 4).map((p, i) => (
                                   <div key={i} className="w-8 h-8 rounded-full bg-black border-2 border-white/10 flex items-center justify-center text-xs font-bold text-white/60 group-hover:border-white/30 transition-colors" title={p}>
                                     {p.charAt(0)}
                                  </div>
                               ))}
                               {jumpCut.partners.length > 4 && (
                                 <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-white/10 flex items-center justify-center text-[10px] font-bold text-white/40">
                                   +{jumpCut.partners.length - 4}
                                 </div>
                               )}
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-white/50 tracking-wide">{jumpCut.fee} network fee</span>
                              <div className="flex items-center gap-2 text-white/40 group-hover:text-white transition-colors">
                                <span className="text-xs font-mono">{jumpCut.nodes.length} participants</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                              </div>
                            </div>
                          </div>
                        </div>
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
                    className="group inline-flex items-center gap-3 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded transition-all"
                  >
                    <Eye className="w-4 h-4 text-white/40 group-hover:text-white transition-colors" />
                    <span className="text-sm font-mono text-white/60 group-hover:text-white transition-colors">Explore All {participants.length} Participants</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-1 transition-all" />
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
                  <h2 className="text-2xl font-bold font-sans tracking-tight text-white">Network Participants</h2>
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
                      className="w-64 bg-white/5 border border-white/10 rounded py-2 pl-10 pr-4 text-xs focus:outline-none focus:border-white/30 transition-all font-mono"
                    />
                  </div>

                  {(filter || selectedRole !== 'ALL') && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/30 rounded transition-all text-xs font-mono text-white/60 hover:text-white"
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
                    className={`flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold tracking-wide transition-all whitespace-nowrap ${
                      selectedRole === role 
                        ? 'border border-white/30 bg-black/40 text-white' 
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

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
              {communityFlows.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold font-sans tracking-tight text-white/80">Community Flows</h3>
                    <div className="h-px bg-white/20 flex-1" />
                    <span className="text-[10px] font-mono text-white/40 tracking-wide">{communityFlows.length} flows seeking members</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {communityFlows.map((flow, index) => {
                      const isJoining = joiningFlows.has(flow.id);
                      const hasJoined = joinedFlows.has(flow.id);
                      const flowParticipants = flow.participants || [];
                      const filledRoles = flowParticipants.filter(p => p.partyId).length;
                      const totalRoles = flowParticipants.length;
                      const missingRoles = flowParticipants.filter(p => !p.partyId);
                      
                      return (
                        <motion.div
                          key={flow.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <div className="p-5 border border-white/10 bg-black/30 rounded hover:border-white/30 transition-all">
                            <div className="space-y-4">
                              <div className="flex justify-between items-start">
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-bold font-sans text-white truncate">{flow.title}</h4>
                                  <p className="text-xs text-white/60 mt-1 line-clamp-2">{flow.description || 'No description available'}</p>
                                </div>
                                <div className="ml-3 shrink-0">
                                  <div className="w-10 h-10 bg-white/10 rounded flex items-center justify-center">
                                    <Users className="w-5 h-5 text-white/70" />
                                  </div>
                                </div>
                              </div>
                              
                              <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-white/40 font-mono">
                                    {filledRoles}/{totalRoles} roles filled
                                  </span>
                                  <span className="text-white/50 font-mono">
                                    {flow.orgId?.split('::')[0]}
                                  </span>
                                </div>
                                
                                {missingRoles.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[10px] text-white/40 font-mono tracking-wide">Looking for:</p>
                                    <div className="flex flex-wrap gap-1">
                                      {missingRoles.slice(0, 3).map((role, i) => (
                                        <span
                                          key={i}
                                          className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60"
                                        >
                                          {role.role}
                                        </span>
                                      ))}
                                      {missingRoles.length > 3 && (
                                        <span className="px-2 py-1 bg-white/10 border border-white/10 rounded text-[9px] font-mono text-white/40">
                                          +{missingRoles.length - 3}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                
                                <button
                                  onClick={() => handleJoinFlow(flow.id)}
                                  disabled={isJoining || hasJoined}
                                  className="w-full px-3 py-2 border border-white/30 text-white rounded text-[10px] font-bold hover:border-white/50 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  {hasJoined ? (
                                    <>
                                      <Star className="w-3 h-3 fill-current" />
                                      Request Sent
                                    </>
                                  ) : isJoining ? (
                                    'Sending Request...'
                                  ) : (
                                    <>
                                      <Plus className="w-3 h-3" />
                                      Request to Join
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {communityFlows.length === 0 && currentViewState === 'browsing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="max-w-sm mx-auto space-y-3">
                    <div className="w-16 h-16 bg-white/5 rounded flex items-center justify-center mx-auto">
                      <Users className="w-8 h-8 text-white/20" />
                    </div>
                    <h3 className="text-sm font-bold text-white/60">No Community Flows Yet</h3>
                    <p className="text-xs text-white/40 font-mono leading-relaxed">
                      Build a flow and publish it to let other participants discover and join your workflow!
                    </p>
                  </div>
                </motion.div>
              )}

              <div>
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
                        initial={groupIndex < 4 ? { opacity: 0, y: 20 } : false}
                        animate={{ opacity: 1, y: 0 }}
                        transition={groupIndex < 4 ? { delay: groupIndex * 0.08, duration: 0.2 } : { duration: 0 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-3">
                          <h3 className="text-sm font-bold font-sans tracking-wide text-white/80">{role}</h3>
                          <div className="h-px bg-white/10 flex-1" />
                          <span className="text-[9px] font-mono text-white/30 tracking-wide">{roleParticipants.length} participants</span>
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
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
