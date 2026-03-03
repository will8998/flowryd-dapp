"use client";

import React, { useState, useMemo } from 'react';
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
  ArrowLeft,
  Plus,
  Search,
  Building2,
  User,
  CheckCircle,
  X,
  ArrowRight,
  Workflow,
  Eye,
  Lock
} from 'lucide-react';
import { 
  getParticipantsForTemplate 
} from '@/lib/canton-templates-data';
import type { 
  CantonFlow, 
  CantonFlowStep, 
  TemplateParticipantMapping 
} from '@/lib/canton-templates-data';

// Icon mapping (same as other components)
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


interface ParticipantSelectorProps {
  step: CantonFlowStep;
  eligibleParticipants: TemplateParticipantMapping[];
  selectedParticipant: TemplateParticipantMapping | null;
  onSelectParticipant: (participant: TemplateParticipantMapping) => void;
  onClose: () => void;
}

const ParticipantSelector: React.FC<ParticipantSelectorProps> = ({
  step,
  eligibleParticipants,
  selectedParticipant,
  onSelectParticipant,
  onClose
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return eligibleParticipants;
    
    const term = searchTerm.toLowerCase();
    return eligibleParticipants.filter(p => 
      p.organization.toLowerCase().includes(term) ||
      p.cantonRole.toLowerCase().includes(term) ||
      (p.foundationCategory?.toLowerCase().includes(term))
    );
  }, [eligibleParticipants, searchTerm]);

  // Group by type
  const groupedParticipants = useMemo(() => {
    const sv = filteredParticipants.filter(p => p.isSV);
    const validators = filteredParticipants.filter(p => p.isValidator && !p.isSV);
    const others = filteredParticipants.filter(p => !p.isSV && !p.isValidator);
    
    return { sv, validators, others };
  }, [filteredParticipants]);

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
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                Select Participant for {step.templateName}
              </h2>
              <p className="text-sm text-white/60">{step.action}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/40 hover:text-white transition-colors rounded hover:bg-white/5"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search participants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-10 py-3 text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {groupedParticipants.sv.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-amber-400 tracking-wide uppercase mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  Super Validators ({groupedParticipants.sv.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedParticipants.sv.map((participant) => (
                    <ParticipantCard
                      key={participant.participantId}
                      participant={participant}
                      isSelected={selectedParticipant?.participantId === participant.participantId}
                      onClick={() => onSelectParticipant(participant)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedParticipants.validators.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-blue-400 tracking-wide uppercase mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Validators ({groupedParticipants.validators.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedParticipants.validators.map((participant) => (
                    <ParticipantCard
                      key={participant.participantId}
                      participant={participant}
                      isSelected={selectedParticipant?.participantId === participant.participantId}
                      onClick={() => onSelectParticipant(participant)}
                    />
                  ))}
                </div>
              </div>
            )}

            {groupedParticipants.others.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-white/60 tracking-wide uppercase mb-3 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Participants ({groupedParticipants.others.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {groupedParticipants.others.map((participant) => (
                    <ParticipantCard
                      key={participant.participantId}
                      participant={participant}
                      isSelected={selectedParticipant?.participantId === participant.participantId}
                      onClick={() => onSelectParticipant(participant)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface ParticipantCardProps {
  participant: TemplateParticipantMapping;
  isSelected: boolean;
  onClick: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, isSelected, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        p-4 rounded border cursor-pointer transition-all
        ${isSelected 
          ? 'border-white/30 bg-white/10 ring-1 ring-white/20' 
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
        }
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="font-medium text-white text-sm">{participant.organization}</div>
          <div className="text-xs text-white/60 mt-1 line-clamp-2">{participant.cantonRole}</div>
          {participant.foundationCategory && (
            <div className="text-xs text-blue-400/60 mt-1">{participant.foundationCategory}</div>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          {participant.isSV && (
            <div className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
              SV
            </div>
          )}
          {participant.isValidator && (
            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
              VAL
            </div>
          )}
          {isSelected && <CheckCircle className="w-4 h-4 text-green-400" />}
        </div>
      </div>
    </motion.div>
  );
};

interface StepPipelineProps {
  steps: CantonFlowStep[];
  selectedParticipants: Record<string, TemplateParticipantMapping>;
  onStepClick: (step: CantonFlowStep) => void;
  onParticipantSlotClick: (step: CantonFlowStep) => void;
  activeStepIndex: number;
}

const StepPipeline: React.FC<StepPipelineProps> = ({
  steps,
  selectedParticipants,
  onStepClick,
  onParticipantSlotClick,
  activeStepIndex
}) => {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const Icon = templateIconMap[step.templateName] || Shield;
        const isLast = index === steps.length - 1;
        const isActive = index === activeStepIndex;
        const hasParticipant = selectedParticipants[`${step.flowId}-${step.step}`];
        
        return (
          <motion.div
            key={`${step.flowId}-${step.step}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <div className={`
              flex items-start gap-4 p-4 rounded border transition-all cursor-pointer
              ${isActive 
                ? 'border-white/30 bg-white/5' 
                : 'border-white/10 bg-black/20 hover:border-white/20'
              }
            `}
            onClick={() => onStepClick(step)}
            >
              {/* Step Number & Connector */}
              <div className="flex flex-col items-center">
                <div className={`
                  w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold
                  ${hasParticipant 
                    ? 'border-green-500 bg-green-500/20 text-green-400' 
                    : 'border-white/20 bg-white/10 text-white/60'
                  }
                `}>
                  {hasParticipant ? <CheckCircle className="w-4 h-4" /> : step.step}
                </div>
                {!isLast && (
                  <div className="w-px h-16 bg-gradient-to-b from-white/20 to-white/5 mt-2" />
                )}
              </div>
              
              {/* Step Content */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1.5 bg-white/10 rounded border border-white/20">
                    <Icon className="w-4 h-4 text-white/60" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{step.templateName}</div>
                    <div className="text-xs text-white/40 line-clamp-1">{step.action}</div>
                  </div>
                </div>
                
                {/* Participant Slot */}
                <div className="mt-3">
                  {hasParticipant ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 bg-white/5 border border-white/10 rounded cursor-pointer hover:bg-white/10 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onParticipantSlotClick(step);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-white/40" />
                        <div>
                          <div className="font-medium text-white text-sm">
                            {hasParticipant.organization}
                          </div>
                          <div className="text-xs text-white/40">
                            {hasParticipant.cantonRole}
                          </div>
                        </div>
                        <div className="ml-auto">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="p-3 border-2 border-dashed border-white/20 rounded cursor-pointer hover:border-white/30 transition-colors flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onParticipantSlotClick(step);
                      }}
                    >
                      <div className="flex items-center gap-2 text-white/40 hover:text-white/60 transition-colors">
                        <Plus className="w-4 h-4" />
                        <span className="text-sm font-medium">Select Participant</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

interface StepDetailsPanelProps {
  step: CantonFlowStep | null;
  participant: TemplateParticipantMapping | null;
}

const StepDetailsPanel: React.FC<StepDetailsPanelProps> = ({ step, participant }) => {
  if (!step) {
    return (
      <div className="p-6 text-center text-white/40">
        <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Select a step to view details</p>
      </div>
    );
  }

  const Icon = templateIconMap[step.templateName] || Shield;

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-white/10 rounded border border-white/20">
          <Icon className="w-6 h-6 text-white/60" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">{step.templateName}</h3>
          <div className="text-sm text-white/40">Step {step.step}</div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-bold text-white/60 tracking-wide uppercase mb-2">Action</h4>
          <p className="text-white/80">{step.action}</p>
        </div>

        {step.inputs && (
          <div>
            <h4 className="text-xs font-bold text-green-400/60 tracking-wide uppercase mb-2 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Inputs
            </h4>
            <p className="text-white/60">{step.inputs}</p>
          </div>
        )}

        {step.outputs && (
          <div>
            <h4 className="text-xs font-bold text-blue-400/60 tracking-wide uppercase mb-2 flex items-center gap-2">
              <ArrowRight className="w-3 h-3" />
              Outputs
            </h4>
            <p className="text-white/60">{step.outputs}</p>
          </div>
        )}

        {step.triggersNext && (
          <div>
            <h4 className="text-xs font-bold text-white/60 tracking-wide uppercase mb-2">Triggers Next</h4>
            <p className="text-white/60">{step.triggersNext}</p>
          </div>
        )}

        {step.cantonPrivacy && (
          <div>
            <h4 className="text-xs font-bold text-purple-400/60 tracking-wide uppercase mb-2 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Privacy
            </h4>
            <p className="text-white/60 italic">{step.cantonPrivacy}</p>
          </div>
        )}

        {participant && (
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-xs font-bold text-white/60 tracking-wide uppercase mb-3">Assigned Participant</h4>
            <div className="p-4 bg-white/5 border border-white/10 rounded">
              <div className="font-medium text-white mb-1">{participant.organization}</div>
              <div className="text-sm text-white/60 mb-2">{participant.cantonRole}</div>
              {participant.foundationCategory && (
                <div className="text-xs text-blue-400/60">{participant.foundationCategory}</div>
              )}
              <div className="flex items-center gap-2 mt-3 text-xs">
                {participant.isSV && (
                  <div className="px-2 py-1 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                    Super Validator
                  </div>
                )}
                {participant.isValidator && (
                  <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded border border-blue-500/30">
                    Validator
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TemplateFlowBuilderProps {
  flow: CantonFlow;
  steps: CantonFlowStep[];
  onBack?: () => void;
  onCreateWorkflow?: (flow: CantonFlow, steps: CantonFlowStep[], participants: Record<string, TemplateParticipantMapping>) => void;
}

export const TemplateFlowBuilder: React.FC<TemplateFlowBuilderProps> = ({
  flow,
  steps,
  onBack,
  onCreateWorkflow
}) => {
  const [selectedParticipants, setSelectedParticipants] = useState<Record<string, TemplateParticipantMapping>>({});
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [participantSelectorStep, setParticipantSelectorStep] = useState<CantonFlowStep | null>(null);

  const currentStep = steps[activeStepIndex];
  const currentParticipant = currentStep ? selectedParticipants[`${currentStep.flowId}-${currentStep.step}`] : null;

  const allStepsHaveParticipants = steps.every(step => 
    selectedParticipants[`${step.flowId}-${step.step}`]
  );

  const handleSelectParticipant = (step: CantonFlowStep, participant: TemplateParticipantMapping) => {
    const stepKey = `${step.flowId}-${step.step}`;
    setSelectedParticipants(prev => ({
      ...prev,
      [stepKey]: participant
    }));
    setParticipantSelectorStep(null);
  };

  const handleCreateWorkflow = () => {
    if (allStepsHaveParticipants && onCreateWorkflow) {
      onCreateWorkflow(flow, steps, selectedParticipants);
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] text-white">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 text-white/40 hover:text-white transition-colors rounded hover:bg-white/5"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <Workflow className="w-6 h-6 text-white/70" />
              <div>
                <h1 className="text-2xl font-bold">{flow.name}</h1>
                <p className="text-white/40">Configure participants for each workflow step</p>
              </div>
            </div>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateWorkflow}
            disabled={!allStepsHaveParticipants}
            className={`
              px-6 py-3 rounded font-medium transition-all
              ${allStepsHaveParticipants
                ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30 hover:shadow-green-500/20 shadow-lg'
                : 'bg-white/5 text-white/40 border border-white/10 cursor-not-allowed'
              }
            `}
          >
            Create Live Workflow
          </motion.button>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Side - Step Pipeline */}
        <div className="w-1/2 border-r border-white/5 p-8 overflow-y-auto custom-scrollbar">
          <h2 className="text-lg font-bold text-white/80 mb-6 flex items-center gap-2">
            Workflow Steps
            <span className="text-sm text-white/40 font-normal">
              ({Object.keys(selectedParticipants).length}/{steps.length} assigned)
            </span>
          </h2>
          
          <StepPipeline
            steps={steps}
            selectedParticipants={selectedParticipants}
            onStepClick={(step) => setActiveStepIndex(steps.indexOf(step))}
            onParticipantSlotClick={(step) => setParticipantSelectorStep(step)}
            activeStepIndex={activeStepIndex}
          />
        </div>

        {/* Right Side - Step Details */}
        <div className="w-1/2 border-l border-white/5 overflow-y-auto custom-scrollbar">
          <StepDetailsPanel
            step={currentStep}
            participant={currentParticipant}
          />
        </div>
      </div>

      <AnimatePresence>
        {participantSelectorStep && (
          <ParticipantSelector
            step={participantSelectorStep}
            eligibleParticipants={getParticipantsForTemplate(participantSelectorStep.templateName)}
            selectedParticipant={selectedParticipants[`${participantSelectorStep.flowId}-${participantSelectorStep.step}`] || null}
            onSelectParticipant={(participant) => handleSelectParticipant(participantSelectorStep, participant)}
            onClose={() => setParticipantSelectorStep(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};