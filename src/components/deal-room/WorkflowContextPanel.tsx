"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Users, FileText, Shield, Building, Zap, TrendingUp } from 'lucide-react';
import { cantonFlows, cantonFlowSteps, cantonTemplates } from '@/lib/canton-templates-data';

interface Deal {
  id: string;
  title: string;
  status: string | null;
  flowId?: string | null;
}

interface Participant {
  id: string;
  userId: string;
  role: string | null;
  displayName: string | null;
  partyId: string | null;
}

interface WorkflowContextPanelProps {
  deal: Deal;
  participants: Participant[];
  isExpanded?: boolean;
  onToggle?: () => void;
}

const getTemplateIcon = (templateName: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'Custody Role': Building,
    'Settlement Rail': Zap,
    'Registry Role': FileText,
    'Tokenize / Issuer Role': TrendingUp,
    'Exchange Role': TrendingUp,
    'Compliance Check': Shield,
    'Wallet Provider': Building,
    'Liquidity Provider': TrendingUp,
    'Collateral Agent': Shield,
    'Oracle / Pricing': TrendingUp,
    'Identity Provider': Shield,
    'Explorer': FileText,
    'Bridge Role': Zap,
  };
  
  return iconMap[templateName] || FileText;
};

const getStepStatus = (step: number, dealStatus: string | null, totalSteps: number) => {
  // Map deal status to step progression
  const statusMap: Record<string, number> = {
    'draft': 0,
    'open': Math.ceil(totalSteps * 0.2),
    'negotiating': Math.ceil(totalSteps * 0.6), 
    'locked': Math.ceil(totalSteps * 0.8),
    'committed': totalSteps,
  };
  
  const currentStep = (dealStatus ? statusMap[dealStatus] : 0) || 0;
  
  if (step <= currentStep) return 'completed';
  if (step === currentStep + 1) return 'active';
  return 'pending';
};

const getParticipantForTemplate = (templateName: string, participants: Participant[]) => {
  // Simple matching logic - in real app this would be more sophisticated
  const template = cantonTemplates.find(t => t.name === templateName);
  if (!template) return null;
  
  // Find participant that might match this template's role
  const matchingParticipant = participants.find(p => 
    p.role && p.role.toLowerCase().includes(template.category.toLowerCase().split(' ')[0])
  );
  
  return matchingParticipant || participants[0]; // Fallback to first participant
};

export default function WorkflowContextPanel({ 
  deal, 
  participants, 
  isExpanded = false, 
  onToggle 
}: WorkflowContextPanelProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);
  
  const expanded = onToggle ? isExpanded : localExpanded;
  const toggleExpanded = onToggle || (() => setLocalExpanded(!localExpanded));

  // Find the flow associated with this deal
  const flow = deal.flowId ? cantonFlows.find(f => f.id === deal.flowId) : null;
  const flowSteps = deal.flowId ? cantonFlowSteps.filter(s => s.flowId === deal.flowId).sort((a, b) => a.step - b.step) : [];

  if (!flow || flowSteps.length === 0) {
    return null;
  }

  return (
    <div className="border-b border-white/5 bg-black/20 backdrop-blur-md">
      <div className="px-4 py-2.5">
        <button 
          onClick={toggleExpanded}
          className="flex items-center gap-2 w-full text-left group"
        >
          <div className="flex items-center gap-2 flex-1">
            <motion.div
              animate={{ rotate: expanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-3.5 h-3.5 text-white/40 group-hover:text-white/60 transition-colors" />
            </motion.div>
            <div className="w-4 h-4 rounded bg-white/10 border border-white/20 flex items-center justify-center">
              <FileText className="w-2.5 h-2.5 text-white/60" />
            </div>
            <span className="text-[11px] font-bold text-white/70 tracking-wide">
              WORKFLOW CONTEXT
            </span>
            <div className="h-3 w-px bg-white/10" />
            <span className="text-[10px] text-white/40 font-mono">
              {flow.name}
            </span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
              flow.status === 'PROVEN' ? 'bg-green-500/20 text-green-400' :
              flow.status === 'ACTIVE' ? 'bg-blue-500/20 text-blue-400' :
              flow.status === 'DESIGN' ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-white/10 text-white/40'
            }`}>
              {flow.status}
            </span>
          </div>
          <div className="text-[9px] text-white/30 font-mono">
            {flowSteps.length} steps
          </div>
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="mt-3 overflow-hidden"
            >
              <div className="text-[10px] text-white/50 mb-3 leading-relaxed">
                {flow.description}
              </div>

              {/* Horizontal Step Pipeline */}
              <div className="relative">
                <div className="flex items-center gap-1 overflow-x-auto pb-2">
                  {flowSteps.map((step, index) => {
                    const _template = cantonTemplates.find(t => t.name === step.templateName);
                    const Icon = getTemplateIcon(step.templateName);
                    const status = getStepStatus(step.step, deal.status, flowSteps.length);
                    const assignedParticipant = getParticipantForTemplate(step.templateName, participants);

                    return (
                      <div key={step.step} className="flex items-center shrink-0">
                        {/* Step Node */}
                        <div 
                          className={`relative group cursor-pointer transition-all duration-200 ${
                            status === 'active' ? 'scale-105' : ''
                          }`}
                        >
                          {/* Step Circle */}
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            status === 'completed' 
                              ? 'bg-white/20 border-white/40 text-white/80' 
                              : status === 'active'
                              ? 'bg-white/10 border-white/60 text-white/90 shadow-lg shadow-white/10'
                              : 'bg-white/5 border-white/10 text-white/30'
                          }`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>

                          {/* Active Pulse */}
                          {status === 'active' && (
                            <div className="absolute inset-0 rounded-full border-2 border-white/40 animate-ping" />
                          )}

                          {/* Step Info Tooltip */}
                          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-black/90 backdrop-blur-sm border border-white/10 rounded px-2 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 min-w-[160px]">
                            <div className="text-[9px] font-bold text-white/80 mb-0.5">
                              {step.step}. {step.templateName}
                            </div>
                            <div className="text-[8px] text-white/50 mb-1">
                              {step.action}
                            </div>
                            {assignedParticipant && (
                              <div className="flex items-center gap-1 text-[8px] text-white/40">
                                <Users className="w-2.5 h-2.5" />
                                {assignedParticipant.displayName || assignedParticipant.partyId || 'Unassigned'}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < flowSteps.length - 1 && (
                          <div className={`w-6 h-px transition-colors ${
                            getStepStatus(step.step + 1, deal.status, flowSteps.length) === 'completed'
                              ? 'bg-white/40'
                              : 'bg-white/10'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Step Labels */}
                <div className="flex items-start gap-1 mt-2 overflow-x-auto">
                  {flowSteps.map((step, index) => {
                    const assignedParticipant = getParticipantForTemplate(step.templateName, participants);
                    
                    return (
                      <div key={step.step} className="flex items-center shrink-0">
                        <div className="w-8 text-center">
                          <div className="text-[8px] font-bold text-white/60 mb-0.5 truncate">
                            {step.templateName.split(' ')[0]}
                          </div>
                          {assignedParticipant && (
                            <div className="w-4 h-4 mx-auto rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                              <span className="text-[6px] font-bold text-white/40">
                                {(assignedParticipant.displayName || assignedParticipant.partyId || 'U')[0].toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        {index < flowSteps.length - 1 && <div className="w-6" />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source Info */}
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2 text-[8px] text-white/30">
                <span>Source:</span>
                <span className="font-mono">{flow.source}</span>
                <div className="ml-auto flex items-center gap-1">
                  <Users className="w-2.5 h-2.5" />
                  <span>{participants.length} participants</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}