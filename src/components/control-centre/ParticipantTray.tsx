"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { participants, workflows } from '@/lib/canton-data';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  PanelLeftClose, 
  PanelLeft, 
  Building2, 
  Database, 
  Network, 
  Shield, 
  Wallet, 
  BarChart3, 
  Globe, 
  Landmark,
  Sparkles,
  X 
} from 'lucide-react';

interface ParticipantTrayProps {
  isCollapsed: boolean;
  onToggle: () => void;
  selectedWorkflow?: string | null;
  onSelectWorkflow?: (workflowId: string | null) => void;
}

// Icon mapping based on role keywords
const getRoleIcon = (cantonRole: string) => {
  const role = cantonRole.toLowerCase();
  if (role.includes('banking') || role.includes('custody')) return Building2;
  if (role.includes('registry') || role.includes('data') || role.includes('onchain')) return Database;
  if (role.includes('infrastructure') || role.includes('orchestration')) return Network;
  if (role.includes('compliance') || role.includes('legal')) return Shield;
  if (role.includes('wallet')) return Wallet;
  if (role.includes('exchange') || role.includes('liquidity') || role.includes('asset manager')) return BarChart3;
  if (role.includes('oracle') || role.includes('identity')) return Globe;
  return Landmark; // Default for issuers, financing, etc.
};

const getCriticalityColor = (criticality: 'CRITICAL' | 'REQUIRED' | 'OPTIONAL') => {
  switch (criticality) {
    case 'CRITICAL': return 'bg-amber-500';
    case 'REQUIRED': return 'bg-white/40';
    case 'OPTIONAL': return 'bg-white/10';
  }
};

export const ParticipantTray: React.FC<ParticipantTrayProps> = ({ 
  isCollapsed, 
  onToggle,
  selectedWorkflow = null,
  onSelectWorkflow
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Array.from(new Set(participants.map(p => p.cantonRole))))
  );

  const activeWorkflow = useMemo(() => 
    workflows.find(w => w.id === selectedWorkflow) || null
  , [selectedWorkflow]);

  const recommendedParticipantIds = useMemo(() => {
    if (!activeWorkflow) return new Set<string>();
    const roleSet = new Set(activeWorkflow.roles);
    return new Set(
      participants
        .filter(p => Object.keys(p.capabilities).some(cap => roleSet.has(cap)))
        .map(p => p.id)
    );
  }, [activeWorkflow]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return participants;
    
    const term = searchTerm.toLowerCase();
    return participants.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.cantonRole.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const groupedParticipants = useMemo(() => {
    const groups: Record<string, typeof participants> = {};
    
    filteredParticipants.forEach(participant => {
      const role = participant.cantonRole;
      if (!groups[role]) groups[role] = [];
      groups[role].push(participant);
    });

    // Sort groups alphabetically and participants within each group
    const sortedGroups: [string, typeof participants][] = Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([role, participants]) => [role, participants.sort((a, b) => a.name.localeCompare(b.name))]);

    return sortedGroups;
  }, [filteredParticipants]);

  const toggleGroup = (role: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(role)) {
        next.delete(role);
      } else {
        next.add(role);
      }
      return next;
    });
  };

  const onDragStart = (event: React.DragEvent, participantId: string) => {
    event.dataTransfer.setData('application/reactflow', participantId);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col"
    >
      {/* Header - Collapsed */}
      {isCollapsed && (
        <div className="flex flex-col items-center justify-center h-full">
          <button
            onClick={onToggle}
            className="p-3 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header - Expanded */}
      {!isCollapsed && (
        <>
          <div className="p-4 border-b border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-bold tracking-wide text-white/60">
                  Participants
                </h2>
                <span className="text-[9px] text-white/30 font-mono">
                  {filteredParticipants.length}
                </span>
              </div>
              <button
                onClick={onToggle}
                className="p-1.5 text-white/60 hover:text-white/80 hover:bg-white/5 rounded-md transition-colors"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/40" />
              <input
                type="text"
                placeholder="Search participants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder:text-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-colors"
              />
            </div>
          </div>

          {onSelectWorkflow && !activeWorkflow && (
            <div className="px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3 h-3 text-blue-400" />
                <p className="text-[9px] tracking-wide text-blue-400/70 font-semibold">Jump Cuts</p>
              </div>
              <div className="space-y-1.5">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => onSelectWorkflow(wf.id)}
                    className="w-full text-left px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-blue-500/5 hover:border-blue-500/20 transition-all group/wf"
                  >
                    <p className="text-[11px] font-semibold text-white/60 group-hover/wf:text-white/80 transition-colors">{wf.name}</p>
                    <p className="text-[8px] text-white/25 mt-0.5 line-clamp-1">{wf.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeWorkflow && onSelectWorkflow && (
            <div className="px-4 py-3 border-b border-blue-500/10 bg-blue-500/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  <p className="text-[10px] font-bold text-blue-400">{activeWorkflow.name}</p>
                </div>
                <button 
                  onClick={() => onSelectWorkflow(null)} 
                  className="p-1 text-white/30 hover:text-white/60 hover:bg-white/5 rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-1">
                {activeWorkflow.stages.map((stage, i) => (
                  <div key={i} className="flex items-start gap-2 py-0.5">
                    <span className="text-[8px] text-blue-500/50 font-mono w-3 shrink-0 pt-px">{i + 1}.</span>
                    <span className="text-[9px] text-white/40">{stage.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-white/20 mt-2">
                Recommended partners highlighted below
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            <div className="p-2 space-y-1">
              {groupedParticipants.map(([role, roleParticipants]) => {
                const isExpanded = expandedGroups.has(role);
                const IconComponent = getRoleIcon(role);
                
                return (
                  <div key={role} className="space-y-1">
                    {/* Group Header */}
                    <button
                      onClick={() => toggleGroup(role)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-white/5 rounded-md transition-colors group"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 text-white/30" />
                      ) : (
                        <ChevronRight className="w-3 h-3 text-white/30" />
                      )}
                      <span className="text-[9px] tracking-wide text-white/30 font-semibold flex-1 truncate">
                        {role}
                      </span>
                      <span className="text-[9px] text-white/30 font-mono">
                        {roleParticipants.length}
                      </span>
                    </button>

                    {/* Group Participants */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden ml-2 space-y-0.5"
                        >
                          {roleParticipants.map((participant) => {
                            const isRec = recommendedParticipantIds.has(participant.id);
                            return (
                              <div
                                key={participant.id}
                                draggable
                                onDragStart={(event) => onDragStart(event, participant.id)}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing group/item hover:scale-[1.02] transition-all ${
                                  isRec 
                                    ? 'bg-blue-500/[0.06] hover:bg-blue-500/10 border border-blue-500/10' 
                                    : 'hover:bg-white/5'
                                }`}
                                style={{ height: '40px' }}
                              >
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                  <IconComponent className={`w-4 h-4 ${isRec ? 'text-blue-400' : 'text-blue-500'}`} />
                                </div>
                                
                                <div className="min-w-0 flex-1">
                                  <p className={`text-[11px] font-bold truncate leading-none ${isRec ? 'text-white/90' : 'text-white/80'}`}>
                                    {participant.name}
                                  </p>
                                  <p className="text-[8px] text-white/30 truncate leading-none mt-0.5">
                                    {participant.cantonRole}
                                  </p>
                                </div>
                                
                                {isRec && (
                                  <span className="text-[6px] font-bold text-blue-400 bg-blue-500/10 px-1 py-0.5 rounded tracking-wide shrink-0">
                                    Rec
                                  </span>
                                )}

                                <div 
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${getCriticalityColor(participant.criticality)}`}
                                  title={participant.criticality}
                                />
                              </div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
