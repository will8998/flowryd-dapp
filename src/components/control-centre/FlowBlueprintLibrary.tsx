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
  ChevronDown,
  ChevronRight,
  Workflow
} from 'lucide-react';
import { cantonFlows, getStepsForFlow } from '@/lib/canton-templates-data';
import type { CantonFlow, CantonFlowStep } from '@/lib/canton-templates-data';

// Icon mapping based on template name (same as TemplateGallery)
const templateIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
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

// Status badge configuration
const statusConfig = {
  PROVEN: { 
    label: 'PROVEN', 
    color: 'text-green-400', 
    bg: 'bg-green-500/20', 
    border: 'border-green-500/30',
    glow: 'shadow-green-500/20 shadow-lg'
  },
  ACTIVE: { 
    label: 'ACTIVE', 
    color: 'text-blue-400', 
    bg: 'bg-blue-500/20', 
    border: 'border-blue-500/30',
    glow: 'shadow-blue-500/20 shadow-lg'
  },
  DESIGN: { 
    label: 'DESIGN', 
    color: 'text-amber-400', 
    bg: 'bg-amber-500/20', 
    border: 'border-amber-500/30',
    glow: ''
  },
  PLANNED: { 
    label: 'PLANNED', 
    color: 'text-gray-400', 
    bg: 'bg-gray-500/20', 
    border: 'border-gray-500/30',
    glow: ''
  }
};

interface FlowStepVisualizationProps {
  steps: CantonFlowStep[];
}

const FlowStepVisualization: React.FC<FlowStepVisualizationProps> = ({ steps }) => {
  return (
    <div className="mt-6 p-4 bg-black/20 border border-white/10 rounded">
      <h4 className="text-xs font-bold text-white/60 tracking-wide uppercase mb-4 flex items-center gap-2">
        <Workflow className="w-3 h-3" />
        Workflow Steps ({steps.length})
      </h4>
      
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = templateIconMap[step.templateName] || Shield;
          const isLast = index === steps.length - 1;
          
          return (
            <motion.div
              key={`${step.flowId}-${step.step}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-xs font-bold text-white">
                    {step.step}
                  </div>
                  {!isLast && (
                    <div className="w-px h-12 bg-gradient-to-b from-white/20 to-white/5 mt-2" />
                  )}
                </div>
                
                {/* Step Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-1.5 bg-white/10 rounded border border-white/20">
                      <Icon className="w-4 h-4 text-white/60" />
                    </div>
                    <div>
                      <div className="font-medium text-white text-sm">{step.templateName}</div>
                      <div className="text-xs text-white/40">{step.action}</div>
                    </div>
                  </div>
                  
                  {step.inputs && (
                    <div className="text-xs text-white/30 mb-1">
                      <span className="font-bold text-green-400/60">Input:</span> {step.inputs}
                    </div>
                  )}
                  
                  {step.outputs && (
                    <div className="text-xs text-white/30">
                      <span className="font-bold text-blue-400/60">Output:</span> {step.outputs}
                    </div>
                  )}
                  
                  {step.cantonPrivacy && (
                    <div className="text-xs text-purple-400/60 mt-2 italic">
                      {step.cantonPrivacy}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface FlowCardProps {
  flow: CantonFlow;
  steps: CantonFlowStep[];
  expanded: boolean;
  onToggleExpand: () => void;
  onUseAsBlueprint: () => void;
  index: number;
}

const FlowCard: React.FC<FlowCardProps> = ({ 
  flow, 
  steps, 
  expanded, 
  onToggleExpand, 
  onUseAsBlueprint, 
  index 
}) => {
  const statusStyle = statusConfig[flow.status];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`
        border border-white/10 bg-zinc-900/50 rounded overflow-hidden
        hover:bg-white/5 transition-all duration-200
        ${statusStyle.glow}
      `}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-bold text-white">{flow.name}</h3>
              <div className={`
                px-2 py-1 rounded text-xs font-bold border
                ${statusStyle.bg} ${statusStyle.color} ${statusStyle.border}
              `}>
                {statusStyle.label}
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-xs text-white/40 mb-3">
              <span className="font-bold tracking-wide uppercase">{flow.category}</span>
              <span>•</span>
              <span>{steps.length} steps</span>
              <span>•</span>
              <span>{flow.source}</span>
            </div>
            
            <p className="text-sm text-white/60 leading-relaxed line-clamp-2">
              {flow.description}
            </p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            onClick={onToggleExpand}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-white/60 hover:text-white transition-colors"
          >
            {expanded ? (
              <>
                <ChevronDown className="w-4 h-4" />
                Hide Steps
              </>
            ) : (
              <>
                <ChevronRight className="w-4 h-4" />
                Show Steps
              </>
            )}
          </button>
          
          <button
            onClick={onUseAsBlueprint}
            className={`
              px-4 py-2 rounded font-medium text-sm transition-all
              bg-white/10 border border-white/20 text-white
              hover:bg-white/20 hover:border-white/30
              ${statusStyle.glow ? 'hover:' + statusStyle.glow : ''}
            `}
          >
            Use as Blueprint
          </button>
        </div>
        
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <FlowStepVisualization steps={steps} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

interface FlowBlueprintLibraryProps {
  onUseBlueprint?: (flow: CantonFlow, steps: CantonFlowStep[]) => void;
}

export const FlowBlueprintLibrary: React.FC<FlowBlueprintLibraryProps> = ({ onUseBlueprint }) => {
  const [expandedFlows, setExpandedFlows] = useState<Set<string>>(new Set());

  const toggleExpanded = (flowId: string) => {
    setExpandedFlows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(flowId)) {
        newSet.delete(flowId);
      } else {
        newSet.add(flowId);
      }
      return newSet;
    });
  };

  const handleUseAsBlueprint = (flow: CantonFlow) => {
    const steps = getStepsForFlow(flow.id);
    onUseBlueprint?.(flow, steps);
    // Connected to TemplateFlowBuilder via onUseBlueprint callback
  };

  // Group flows by category
  const flowsByCategory = cantonFlows.reduce((groups, flow) => {
    if (!groups[flow.category]) {
      groups[flow.category] = [];
    }
    groups[flow.category].push(flow);
    return groups;
  }, {} as Record<string, CantonFlow[]>);

  const categories = Object.keys(flowsByCategory).sort();

  return (
    <div className="h-full flex flex-col bg-[#020202] text-white">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="w-6 h-6 text-white/70" />
          <h1 className="text-2xl font-bold">Flow Blueprints</h1>
        </div>
        <p className="text-white/40">Proven workflow templates from Canton working groups</p>
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
              <h2 className="text-lg font-bold text-white/80 mb-6 flex items-center gap-2">
                <div className="w-1 h-6 bg-white/20 rounded" />
                {category}
                <span className="text-sm text-white/40 font-normal">
                  ({flowsByCategory[category].length})
                </span>
              </h2>
              
              <div className="space-y-4">
                {flowsByCategory[category].map((flow, index) => {
                  const steps = getStepsForFlow(flow.id);
                  return (
                    <FlowCard
                      key={flow.id}
                      flow={flow}
                      steps={steps}
                      expanded={expandedFlows.has(flow.id)}
                      onToggleExpand={() => toggleExpanded(flow.id)}
                      onUseAsBlueprint={() => handleUseAsBlueprint(flow)}
                      index={index}
                    />
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};