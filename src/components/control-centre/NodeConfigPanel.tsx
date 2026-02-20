"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, RefreshCw, Shield, Zap, ShieldCheck, Database, Network, Wallet, Globe, Landmark, BarChart3, Building2, Layers } from 'lucide-react';
import { participants } from '@/lib/canton-data';

interface NodeConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
  node: { id: string; data: { participantId: string; isUserOrg?: boolean; orgName?: string } } | null;
  onUpdateNode: (nodeId: string, data: Record<string, unknown>) => void;
  onDeleteNode: (nodeId: string) => void;
}

const getRoleIcon = (cantonRole: string) => {
  const role = cantonRole.toLowerCase();
  if (role.includes('custody') || role.includes('custod')) return <Shield className="w-4 h-4 text-white/70" />;
  if (role.includes('exchange')) return <BarChart3 className="w-4 h-4 text-white/70" />;
  if (role.includes('liquidity') || role.includes('market') || role.includes('prime')) return <Zap className="w-4 h-4 text-white/70" />;
  if (role.includes('registry') || role.includes('issuer')) return <Database className="w-4 h-4 text-white/70" />;
  if (role.includes('compliance') || role.includes('legal')) return <ShieldCheck className="w-4 h-4 text-white/70" />;
  if (role.includes('wallet')) return <Wallet className="w-4 h-4 text-white/70" />;
  if (role.includes('oracle') || role.includes('data') || role.includes('onchain')) return <Globe className="w-4 h-4 text-white/70" />;
  if (role.includes('bank') || role.includes('financ') || role.includes('repo') || role.includes('loan')) return <Landmark className="w-4 h-4 text-white/70" />;
  if (role.includes('infrastructure') || role.includes('infra') || role.includes('orchestr')) return <Network className="w-4 h-4 text-white/70" />;
  if (role.includes('identity')) return <ShieldCheck className="w-4 h-4 text-white/70" />;
  if (role.includes('stablecoin') || role.includes('stable')) return <Landmark className="w-4 h-4 text-white/70" />;
  if (role.includes('token') || role.includes('asset manager')) return <Layers className="w-4 h-4 text-white/70" />;
  if (role.includes('collateral')) return <Shield className="w-4 h-4 text-white/70" />;
  return <Building2 className="w-4 h-4 text-white/70" />;
};

const getCriticalityBadge = (criticality: string) => {
  switch (criticality) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 border border-amber-500/30 rounded text-[10px] font-bold text-amber-300 tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_4px_#f59e0b]" />
          CRITICAL
        </span>
      );
    case 'REQUIRED':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 border border-white/20 rounded text-[10px] font-bold text-white/70 tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-white/60" />
          REQUIRED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/50 tracking-wide">
          <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
          OPTIONAL
        </span>
      );
  }
};

export const NodeConfigPanel: React.FC<NodeConfigPanelProps> = ({
  isOpen,
  onClose,
  node,
  onUpdateNode: _onUpdateNode,
  onDeleteNode
}) => {
  const participant = node && !node.data.isUserOrg 
    ? participants.find(p => p.id === node.data.participantId)
    : null;

  const isUserOrg = node?.data.isUserOrg;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handleRemoveNode = () => {
    if (node && !isUserOrg) {
      if (confirm(`Remove ${participant?.name || 'this participant'} from the flow?`)) {
        onDeleteNode(node.id);
        onClose();
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && node && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 right-0 w-72 h-full bg-[#0a0a0a]/95 backdrop-blur-xl border-l border-white/10 z-50 flex flex-col"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                {isUserOrg ? (
                  <Building2 className="w-4 h-4 text-white/70" />
                ) : (
                  participant ? getRoleIcon(participant.cantonRole) : <Building2 className="w-4 h-4 text-white/20" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white/90 font-sans">
                  {isUserOrg ? (node.data.orgName || 'Your Organization') : (participant?.name || 'Unknown Participant')}
                </h3>
                {isUserOrg && (
                  <span className="text-[10px] font-bold text-white/70 bg-white/10 px-1.5 py-0.5 rounded-full tracking-wide">
                    YOUR ORGANIZATION
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-4 h-4 text-white/60" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {isUserOrg ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white/80 mb-2 tracking-wide">ORGANIZATION</h4>
                  <p className="text-sm text-white/60">
                    This is your organization node. It represents your company in the flow and serves as the central connection point for all partnerships.
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white/80 mb-2 tracking-wide">ROLE</h4>
                  <p className="text-sm text-white/60">Primary Flow Orchestrator</p>
                </div>
              </div>
            ) : participant ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white/80 mb-3 tracking-wide">DETAILS</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-1">CANTON ROLE</label>
                      <p className="text-sm text-white/80">{participant.cantonRole}</p>
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-1">CRITICALITY</label>
                      {getCriticalityBadge(participant.criticality)}
                    </div>

                    {participant.capabilities && Object.keys(participant.capabilities).length > 0 && (
                      <div>
                        <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-2">CAPABILITIES</label>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(participant.capabilities).map(capability => (
                            <span
                              key={capability}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] font-mono text-white/60"
                            >
                              {capability.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {participant.description && (
                      <div>
                        <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-1">DESCRIPTION</label>
                        <p className="text-xs text-white/60 leading-relaxed">{participant.description}</p>
                      </div>
                    )}

                    {participant.holdings && (
                      <div>
                        <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-1">HOLDINGS</label>
                        <p className="text-sm text-white/80 font-mono">{participant.holdings}</p>
                      </div>
                    )}

                    {participant.validatorNodes !== undefined && participant.validatorNodes > 0 && (
                      <div>
                        <label className="text-[10px] font-bold text-white/50 tracking-wide block mb-1">VALIDATOR NODES</label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white/80 font-mono">{participant.validatorNodes}</p>
                          {participant.superValidator && (
                            <span className="px-1.5 py-0.5 bg-amber-500/20 border border-amber-500/30 rounded text-[8px] font-bold text-amber-300 tracking-wide">
                              SUPER
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-white/80 mb-3 tracking-wide">ACTIONS</h4>
                  <div className="space-y-2">
                    <button
                      onClick={handleRemoveNode}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg text-sm font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Remove from Flow
                    </button>
                    
                    <button
                      disabled
                      className="w-full flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold text-white/30 cursor-not-allowed relative group"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Replace Participant
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 border border-white/20 rounded text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Coming Soon
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-white/80 mb-2 tracking-wide">UNKNOWN PARTICIPANT</h4>
                  <p className="text-sm text-white/60">
                    This participant could not be found in the registry.
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};