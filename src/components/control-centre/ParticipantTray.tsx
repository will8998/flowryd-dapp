"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFlowParticipants } from '@/hooks/use-flow-participants';
import type { Participant } from '@/lib/canton-data';
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
  X,
  Eye,
  Layers,
  Users,
  ExternalLink,
  ArrowLeft,
  GripVertical
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
  const { participants, workflows, isLoading } = useFlowParticipants();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Array.from(new Set(participants.map(p => p.cantonRole))))
  );
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);

  const activeWorkflow = useMemo(() => 
    workflows.find(w => w.id === selectedWorkflow) || null
  , [selectedWorkflow, workflows]);

  const recommendedParticipantIds = useMemo(() => {
    if (!activeWorkflow) return new Set<string>();
    const roleSet = new Set(activeWorkflow.roles);
    return new Set(
      participants
        .filter(p => Object.keys(p.capabilities).some(cap => roleSet.has(cap)))
        .map(p => p.id)
    );
  }, [activeWorkflow, participants]);

  const filteredParticipants = useMemo(() => {
    if (!searchTerm.trim()) return participants;
    
    const term = searchTerm.toLowerCase();
    return participants.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.cantonRole.toLowerCase().includes(term)
    );
  }, [searchTerm, participants]);

  const groupedParticipants = useMemo(() => {
    const groups: Record<string, typeof participants> = {};
    
    filteredParticipants.forEach(participant => {
      const role = participant.cantonRole;
      if (!groups[role]) groups[role] = [];
      groups[role].push(participant);
    });

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
    setSelectedParticipant(null);
  };

  return (
    <motion.div
      animate={{ width: isCollapsed ? 56 : 240 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="h-full bg-[#0a0a0a] border-r border-white/5 flex flex-col overflow-hidden"
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
          <div className="p-4 border-b border-white/5 shrink-0">
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
                className="w-full pl-9 pr-3 py-2 text-xs font-mono bg-white/5 border border-white/10 rounded-lg text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/30 focus:bg-white/[0.08] transition-colors"
              />
            </div>
          </div>

          {onSelectWorkflow && !activeWorkflow && (
            <div className="px-4 py-3 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-1.5 mb-2.5">
                <Sparkles className="w-3 h-3 text-white/60" />
                <p className="text-[9px] tracking-wide text-white/60 font-semibold">Jump Cuts</p>
              </div>
              <div className="space-y-1.5">
                {workflows.map(wf => (
                  <button
                    key={wf.id}
                    onClick={() => onSelectWorkflow(wf.id)}
                    className="w-full text-left px-3 py-2.5 bg-white/[0.02] border border-white/5 rounded-lg hover:bg-white/5 hover:border-white/10 transition-all group/wf"
                  >
                    <p className="text-[11px] font-semibold text-white/60 group-hover/wf:text-white/80 transition-colors">{wf.name}</p>
                    <p className="text-[8px] text-white/25 mt-0.5 line-clamp-1">{wf.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeWorkflow && onSelectWorkflow && (
            <div className="px-4 py-3 border-b border-white/10 bg-white/10 shrink-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-white/60" />
                  <p className="text-[10px] font-bold text-white/60">{activeWorkflow.name}</p>
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
                    <span className="text-[8px] text-white/50 font-mono w-3 shrink-0 pt-px">{i + 1}.</span>
                    <span className="text-[9px] text-white/40">{stage.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-[8px] text-white/20 mt-2">
                Recommended partners highlighted below
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
            {isLoading ? (
              <div className="p-4 text-center">
                <p className="text-xs text-white/60">Loading...</p>
              </div>
            ) : (
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
                                onClick={() => setSelectedParticipant(participant)}
                                className={`flex items-center gap-2 p-2 rounded-md cursor-grab active:cursor-grabbing group/item hover:scale-[1.02] transition-all ${
                                  isRec 
                                    ? 'bg-white/10 hover:bg-white/10 border border-white/10' 
                                    : 'hover:bg-white/5'
                                } ${selectedParticipant?.id === participant.id ? 'ring-1 ring-white/30 bg-white/10' : ''}`}
                                style={{ height: '40px' }}
                              >
                                <div className="w-4 h-4 flex items-center justify-center shrink-0">
                                  <IconComponent className={`w-4 h-4 ${isRec ? 'text-white/70' : 'text-white/70'}`} />
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
                                  <span className="text-[6px] font-bold text-white/60 bg-white/10 px-1 py-0.5 rounded tracking-wide shrink-0">
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
            )}
          </div>
        </>
      )}

      {/* Participant Detail Card - fixed position to the right of tray */}
      <AnimatePresence>
        {selectedParticipant && !isCollapsed && (
          <>
            {/* Click-away overlay */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setSelectedParticipant(null)}
            />

            {/* Detail card */}
            <motion.div
              initial={{ opacity: 0, x: -8, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -8, scale: 0.98 }}
              transition={{ duration: 0.15 }}
              className="fixed left-[252px] top-[100px] w-[320px] max-h-[calc(100vh-140px)] overflow-y-auto bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 custom-scrollbar"
            >
              {/* Header */}
              <div className="sticky top-0 bg-[#0a0a0a] border-b border-white/10 p-4 z-10 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button
                        onClick={() => setSelectedParticipant(null)}
                        className="p-1 -ml-1 text-white/30 hover:text-white hover:bg-white/10 rounded transition-all"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                      <h3 className="text-sm font-bold text-white truncate">{selectedParticipant.name}</h3>
                    </div>
                    <p className="text-[8px] font-mono text-white/30 tracking-wide font-bold ml-6">{selectedParticipant.cantonRole}</p>
                  </div>
                  {selectedParticipant.criticality === 'CRITICAL' && (
                    <div className="px-1.5 py-0.5 bg-white/10 border border-white/20 rounded text-[7px] font-mono font-bold text-white/60 shrink-0">
                      CRITICAL
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-4 space-y-4">
                {/* Description */}
                {selectedParticipant.description && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Eye className="w-3 h-3 text-white/30" />
                      <span className="text-[8px] font-bold font-mono tracking-[0.15em] text-white/30">OVERVIEW</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{selectedParticipant.description}</p>
                  </div>
                )}

                {/* Network Status */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Network className="w-3 h-3 text-white/30" />
                    <span className="text-[8px] font-bold font-mono tracking-[0.15em] text-white/30">NETWORK STATUS</span>
                  </div>
                  <div className="space-y-1.5">
                    {selectedParticipant.validatorNodes !== undefined && selectedParticipant.validatorNodes > 0 && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/40 font-mono">Validator Nodes</span>
                        <span className="text-white/70 font-mono">{selectedParticipant.validatorNodes}</span>
                      </div>
                    )}
                    {selectedParticipant.superValidator && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/40 font-mono">Super Validator</span>
                        <div className="w-2 h-2 rounded-full bg-amber-500" />
                      </div>
                    )}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/40 font-mono">Criticality</span>
                      <span className={`font-mono ${
                        selectedParticipant.criticality === 'CRITICAL' ? 'text-white' :
                        selectedParticipant.criticality === 'REQUIRED' ? 'text-white/70' : 'text-white/50'
                      }`}>{selectedParticipant.criticality}</span>
                    </div>
                    {selectedParticipant.location && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-white/40 font-mono">Location</span>
                        <span className="text-white/60 font-mono">{selectedParticipant.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Capabilities */}
                {selectedParticipant.capabilities && Object.keys(selectedParticipant.capabilities).length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Layers className="w-3 h-3 text-white/30" />
                      <span className="text-[8px] font-bold font-mono tracking-[0.15em] text-white/30">CAPABILITIES</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(selectedParticipant.capabilities).map(([cap, value]) => (
                        value === 1 && (
                          <span key={cap} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded font-mono text-white/50">
                            {cap.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {/* Partners */}
                {selectedParticipant.partners && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Users className="w-3 h-3 text-white/30" />
                      <span className="text-[8px] font-bold font-mono tracking-[0.15em] text-white/30">PARTNERS</span>
                    </div>
                    <p className="text-[11px] text-white/60 leading-relaxed">{selectedParticipant.partners}</p>
                  </div>
                )}

                {/* Links */}
                {(selectedParticipant.website || selectedParticipant.xHandle) && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <ExternalLink className="w-3 h-3 text-white/30" />
                      <span className="text-[8px] font-bold font-mono tracking-[0.15em] text-white/30">LINKS</span>
                    </div>
                    <div className="space-y-1.5">
                      {selectedParticipant.website && (
                        <a
                          href={selectedParticipant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] text-white/60 hover:text-white transition-colors"
                        >
                          <Globe className="w-3 h-3" />
                          <span className="truncate">{selectedParticipant.website.replace(/^https?:\/\//, '')}</span>
                        </a>
                      )}
                      {selectedParticipant.xHandle && (
                        <a
                          href={`https://x.com/${selectedParticipant.xHandle.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-[11px] text-white/60 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{selectedParticipant.xHandle}</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Drag hint */}
              <div className="sticky bottom-0 p-3 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a] to-transparent pt-6">
                <div className="flex items-center justify-center gap-2 py-2 border border-dashed border-white/10 rounded-lg">
                  <GripVertical className="w-3 h-3 text-white/30" />
                  <span className="text-[9px] font-mono text-white/30">Drag from sidebar to add to canvas</span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
