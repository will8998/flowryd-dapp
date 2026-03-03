"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  Landmark, 
  Database, 
  Layers, 
  BarChart3, 
  ShieldCheck, 
  Wallet, 
  Zap, 
  Globe, 
  Network,
  X,
  Users,
  Building2,
  ArrowRight,
  Workflow
} from 'lucide-react';
import { cantonTemplates, cantonFlows, cantonFlowSteps, templateParticipants } from '@/lib/canton-templates-data';
import type { CantonTemplate, CantonFlow, CantonFlowStep, TemplateParticipantMapping } from '@/lib/canton-templates-data';

// Icon mapping based on template name
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'Custody Role': Shield,
  'Settlement Rail': Landmark,
  'Registry Role': Database,
  'Tokenize / Issuer Role': Layers,
  'Exchange Role': BarChart3,
  'Compliance Check': ShieldCheck,
  'Wallet Provider': Wallet,
  'Liquidity Provider': Zap,
  'Collateral Agent': Shield,
  'Oracle / Pricing': Globe,
  'Identity Provider': ShieldCheck,
  'Explorer': Globe,
  'Bridge Role': Network,
};

// Color mapping based on template name
const colorMap: Record<string, string> = {
  'Custody Role': 'orange',
  'Settlement Rail': 'blue',
  'Registry Role': 'blue',
  'Tokenize / Issuer Role': 'purple',
  'Exchange Role': 'purple',
  'Compliance Check': 'amber',
  'Wallet Provider': 'cyan',
  'Liquidity Provider': 'green',
  'Collateral Agent': 'orange',
  'Oracle / Pricing': 'cyan',
  'Identity Provider': 'amber',
  'Explorer': 'cyan',
  'Bridge Role': 'indigo',
};

// Style mapping for static Tailwind classes
const STYLE_MAP: Record<string, { bg: string; text: string; border: string; bgLight: string; textLight: string; bgHover: string; borderHover: string; textHover: string; bgHoverLight: string; borderLight: string }> = {
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30', bgLight: 'bg-orange-500/10', textLight: 'text-orange-300', bgHover: 'hover:bg-orange-500/30', borderHover: 'hover:border-orange-500/60', textHover: 'hover:text-orange-200', bgHoverLight: 'group-hover:bg-orange-500/15', borderLight: 'border-orange-500/20' },
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30', bgLight: 'bg-blue-500/10', textLight: 'text-blue-300', bgHover: 'hover:bg-blue-500/30', borderHover: 'hover:border-blue-500/60', textHover: 'hover:text-blue-200', bgHoverLight: 'group-hover:bg-blue-500/15', borderLight: 'border-blue-500/20' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', bgLight: 'bg-purple-500/10', textLight: 'text-purple-300', bgHover: 'hover:bg-purple-500/30', borderHover: 'hover:border-purple-500/60', textHover: 'hover:text-purple-200', bgHoverLight: 'group-hover:bg-purple-500/15', borderLight: 'border-purple-500/20' },
  amber: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30', bgLight: 'bg-amber-500/10', textLight: 'text-amber-300', bgHover: 'hover:bg-amber-500/30', borderHover: 'hover:border-amber-500/60', textHover: 'hover:text-amber-200', bgHoverLight: 'group-hover:bg-amber-500/15', borderLight: 'border-amber-500/20' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30', bgLight: 'bg-cyan-500/10', textLight: 'text-cyan-300', bgHover: 'hover:bg-cyan-500/30', borderHover: 'hover:border-cyan-500/60', textHover: 'hover:text-cyan-200', bgHoverLight: 'group-hover:bg-cyan-500/15', borderLight: 'border-cyan-500/20' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bgLight: 'bg-green-500/10', textLight: 'text-green-300', bgHover: 'hover:bg-green-500/30', borderHover: 'hover:border-green-500/60', textHover: 'hover:text-green-200', bgHoverLight: 'group-hover:bg-green-500/15', borderLight: 'border-green-500/20' },
  indigo: { bg: 'bg-indigo-500/20', text: 'text-indigo-400', border: 'border-indigo-500/30', bgLight: 'bg-indigo-500/10', textLight: 'text-indigo-300', bgHover: 'hover:bg-indigo-500/30', borderHover: 'hover:border-indigo-500/60', textHover: 'hover:text-indigo-200', bgHoverLight: 'group-hover:bg-indigo-500/15', borderLight: 'border-indigo-500/20' },
};

const DEFAULT_STYLE = { bg: 'bg-zinc-500/20', text: 'text-zinc-400', border: 'border-zinc-500/30', bgLight: 'bg-zinc-500/10', textLight: 'text-zinc-300', bgHover: 'hover:bg-zinc-500/30', borderHover: 'hover:border-zinc-500/60', textHover: 'hover:text-zinc-200', bgHoverLight: 'group-hover:bg-zinc-500/15', borderLight: 'border-zinc-500/20' };

// Get border color class based on color
const getBorderColor = (color: string): string => {
  const colorMap: Record<string, string> = {
    orange: 'border-l-orange-500',
    blue: 'border-l-blue-500',
    purple: 'border-l-purple-500',
    amber: 'border-l-amber-500',
    cyan: 'border-l-cyan-500',
    green: 'border-l-green-500',
    indigo: 'border-l-indigo-500',
  };
  return colorMap[color] || 'border-l-white/20';
};

interface TemplateDetailProps {
  template: CantonTemplate;
  participants: TemplateParticipantMapping[];
  onClose: () => void;
  onNavigateToFlow?: (flow: CantonFlow, steps: CantonFlowStep[]) => void;
}

const TemplateDetail: React.FC<TemplateDetailProps> = ({ template, participants, onClose, onNavigateToFlow }) => {
  const Icon = iconMap[template.name] || Shield;
  const color = colorMap[template.name] || 'white';
  
  // Group participants by organization type
  const svParticipants = participants.filter(p => p.isSV);
  const validatorParticipants = participants.filter(p => p.isValidator && !p.isSV);
  const otherParticipants = participants.filter(p => !p.isSV && !p.isValidator);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-zinc-900/95 border border-white/10 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg ${(STYLE_MAP[color] || DEFAULT_STYLE).bg} border ${(STYLE_MAP[color] || DEFAULT_STYLE).border}`}>
                <Icon className={`w-6 h-6 ${(STYLE_MAP[color] || DEFAULT_STYLE).text}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">{template.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold text-white/30 tracking-wide uppercase">
                    {template.category}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-[10px] text-white/40">
                    {participants.length} eligible participants
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {onNavigateToFlow && (
                <button
                  onClick={() => {
                    const syntheticFlow: CantonFlow = {
                      id: `new-${template.id}-${Date.now()}`,
                      name: `New ${template.name} Flow`,
                      category: template.category,
                      description: `Flow built from ${template.name} template`,
                      stepCount: 1,
                      source: 'user',
                      status: 'DESIGN',
                    };
                    const syntheticStep: CantonFlowStep = {
                      flowId: syntheticFlow.id,
                      step: 1,
                      templateName: template.name,
                      action: template.description,
                      inputs: '',
                      outputs: '',
                      triggersNext: '',
                      cantonPrivacy: 'Private',
                    };
                    onNavigateToFlow(syntheticFlow, [syntheticStep]);
                    onClose();
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 ${(STYLE_MAP[color] || DEFAULT_STYLE).bg} ${(STYLE_MAP[color] || DEFAULT_STYLE).bgHover} border ${(STYLE_MAP[color] || DEFAULT_STYLE).border} ${(STYLE_MAP[color] || DEFAULT_STYLE).borderHover} rounded text-sm font-bold ${(STYLE_MAP[color] || DEFAULT_STYLE).textLight} ${(STYLE_MAP[color] || DEFAULT_STYLE).textHover} transition-all`}
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Use Template</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-white/40 hover:text-white transition-colors rounded hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar max-h-[calc(90vh-140px)]">
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-white/60 tracking-wide uppercase mb-3">Description</h3>
              <p className="text-white/80 leading-relaxed">{template.description}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white/60 tracking-wide uppercase mb-4">
                Eligible Participants ({participants.length})
              </h3>

              <div className="space-y-4">
                {svParticipants.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-amber-400 tracking-wide uppercase mb-2 flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      Super Validators ({svParticipants.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {svParticipants.map((participant, index) => (
                        <div
                          key={`${participant.participantId}-${index}`}
                          className="p-3 bg-white/5 border border-white/10 rounded"
                        >
                          <div className="font-medium text-white text-sm">{participant.organization}</div>
                          <div className="text-xs text-white/40 mt-1">{participant.cantonRole}</div>
                          {participant.foundationCategory && (
                            <div className="text-xs text-amber-400/60 mt-1">{participant.foundationCategory}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {validatorParticipants.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-blue-400 tracking-wide uppercase mb-2 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" />
                      Validators ({validatorParticipants.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {validatorParticipants.map((participant, index) => (
                        <div
                          key={`${participant.participantId}-${index}`}
                          className="p-3 bg-white/5 border border-white/10 rounded"
                        >
                          <div className="font-medium text-white text-sm">{participant.organization}</div>
                          <div className="text-xs text-white/40 mt-1">{participant.cantonRole}</div>
                          {participant.foundationCategory && (
                            <div className="text-xs text-blue-400/60 mt-1">{participant.foundationCategory}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {otherParticipants.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold text-white/60 tracking-wide uppercase mb-2 flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      Participants ({otherParticipants.length})
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {otherParticipants.map((participant, index) => (
                        <div
                          key={`${participant.participantId}-${index}`}
                          className="p-3 bg-white/5 border border-white/10 rounded"
                        >
                          <div className="font-medium text-white text-sm">{participant.organization}</div>
                          <div className="text-xs text-white/40 mt-1">{participant.cantonRole}</div>
                          {participant.foundationCategory && (
                            <div className="text-xs text-white/60 mt-1">{participant.foundationCategory}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Used in Flows */}
            {(() => {
              const flowStepsForTemplate = cantonFlowSteps.filter(s => s.templateName === template.name);
              const uniqueFlowIds = [...new Set(flowStepsForTemplate.map(s => s.flowId))];
              const relatedFlows = uniqueFlowIds
                .map(id => cantonFlows.find(f => f.id === id))
                .filter((f): f is CantonFlow => f !== undefined);

              if (relatedFlows.length === 0) return null;

              const statusColors: Record<string, string> = {
                PROVEN: 'bg-emerald-500/20 text-emerald-400',
                ACTIVE: 'bg-blue-500/20 text-blue-400',
                DESIGN: 'bg-amber-500/20 text-amber-400',
                PLANNED: 'bg-white/20 text-white/40',
              };

              return (
                <div>
                  <h3 className="text-sm font-bold text-white/60 tracking-wide uppercase mb-3 flex items-center gap-2">
                    <Workflow className="w-4 h-4" />
                    Used in Flows ({relatedFlows.length})
                  </h3>
                  <div className="space-y-2">
                    {relatedFlows.map((flow) => {
                      const stepsForFlow = cantonFlowSteps.filter(s => s.flowId === flow.id);
                      const stepCount = stepsForFlow.length;
                      const statusClass = statusColors[flow.status] || statusColors.PLANNED;

                      return (
                        <div
                          key={flow.id}
                          className="p-4 bg-white/5 border border-white/10 rounded hover:bg-white/8 transition-colors group/flow"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-white text-sm truncate">{flow.name}</span>
                                <span className={`text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full ${statusClass}`}>
                                  {flow.status}
                                </span>
                              </div>
                              <div className="text-xs text-white/40">
                                {stepCount} step{stepCount !== 1 ? 's' : ''} · {flow.category}
                              </div>
                            </div>
                            {onNavigateToFlow && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onNavigateToFlow(flow, stepsForFlow);
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 rounded text-sm font-medium text-white transition-all opacity-80 group-hover/flow:opacity-100"
                              >
                                <span>Build with Blueprint</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface TemplateCardProps {
  template: CantonTemplate;
  participantCount: number;
  onClick: () => void;
  index: number;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, participantCount, onClick, index }) => {
  const Icon = iconMap[template.name] || Shield;
  const color = colorMap[template.name] || 'white';
  const borderColor = getBorderColor(color);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className={`
        p-4 bg-zinc-900/50 border border-white/5 ${borderColor} border-l-2 rounded
        hover:bg-white/5 transition-all duration-200 cursor-pointer group
      `}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className={`p-2 rounded ${(STYLE_MAP[color] || DEFAULT_STYLE).bgLight} border ${(STYLE_MAP[color] || DEFAULT_STYLE).borderLight} ${(STYLE_MAP[color] || DEFAULT_STYLE).bgHoverLight} transition-colors`}>
            <Icon className={`w-5 h-5 ${(STYLE_MAP[color] || DEFAULT_STYLE).text}`} />
          </div>
          <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded">
            {participantCount}
          </span>
        </div>
        
        <div>
          <h3 className="font-bold text-white text-sm mb-1">{template.name}</h3>
          <div className="text-[10px] font-bold text-white/30 tracking-wide uppercase mb-2">
            {template.category}
          </div>
          <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
            {template.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export const TemplateGallery: React.FC<{ onNavigateToFlow?: (flow: CantonFlow, steps: CantonFlowStep[]) => void }> = ({ onNavigateToFlow }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<CantonTemplate | null>(null);

  // Group templates by category
  const groupedTemplates = cantonTemplates.reduce((groups, template) => {
    const category = template.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(template);
    return groups;
  }, {} as Record<string, CantonTemplate[]>);

  // Get participant count for each template
  const getParticipantCount = (templateName: string): number => {
    return templateParticipants.filter(tp => tp.templateName === templateName).length;
  };

  // Get participants for selected template
  const getParticipantsForTemplate = (templateName: string): TemplateParticipantMapping[] => {
    return templateParticipants.filter(tp => tp.templateName === templateName);
  };

  const categories = Object.keys(groupedTemplates).sort();

  return (
    <div className="h-full flex flex-col bg-[#020202] text-white">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Database className="w-6 h-6 text-white/70" />
          <h1 className="text-2xl font-bold">Template Gallery</h1>
        </div>
        <p className="text-white/40">Reusable building blocks for workflow construction</p>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <div className="space-y-8">
          {categories.map((category, categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: categoryIndex * 0.1 }}
            >
              <h2 className="text-lg font-bold text-white/80 mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-white/20 rounded" />
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {groupedTemplates[category].map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    participantCount={getParticipantCount(template.name)}
                    onClick={() => setSelectedTemplate(template)}
                    index={index}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedTemplate && (
          <TemplateDetail
            template={selectedTemplate}
            participants={getParticipantsForTemplate(selectedTemplate.name)}
            onClose={() => setSelectedTemplate(null)}
            onNavigateToFlow={onNavigateToFlow}
          />
        )}
      </AnimatePresence>
    </div>
  );
};