"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check, Layers, MousePointerClick, Cable, Save } from 'lucide-react';

interface WorkbenchWizardProps {
  onComplete: () => void;
  onSkip: () => void;
}

interface StepPosition {
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  x?: string;
  y?: string;
}

interface Step {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  position: StepPosition;
  arrow: 'up' | 'down' | 'left' | 'none';
}

const STEPS: Step[] = [
  {
    id: 'your-org',
    title: "Your Organisation",
    description: "This node represents your company. It's the starting point for every flow you build on Canton Network.",
    icon: Layers,
    position: { top: '40%', left: '50%', x: '-50%', y: '-140px' },
    arrow: 'down',
  },
  {
    id: 'sidebar',
    title: "Partner Directory",
    description: "Browse Canton Network participants grouped by role. Recommended partners are highlighted when a workflow is active.",
    icon: MousePointerClick,
    position: { top: '50%', left: '180px', x: '0', y: '-50%' },
    arrow: 'left',
  },
  {
    id: 'drag-drop',
    title: "Drag & Drop",
    description: "Drag participants from the sidebar onto the canvas to add them to your flow. They'll snap to the grid automatically.",
    icon: MousePointerClick,
    position: { top: '50%', left: '50%', x: '-50%', y: '-50%' },
    arrow: 'none',
  },
  {
    id: 'connect',
    title: "Connect Nodes",
    description: "Click and drag from one node's handle to another to create connections. These represent the transaction relationships in your workflow.",
    icon: Cable,
    position: { top: '50%', left: '50%', x: '-50%', y: '40px' },
    arrow: 'none',
  },
  {
    id: 'save-publish',
    title: "Save & Publish",
    description: "Save your flow at any time with ⌘S. When ready, publish it to the network or create a Deal Room to begin negotiations.",
    icon: Save,
    position: { top: '80px', right: '100px', x: '0', y: '0' },
    arrow: 'up',
  },
];

export const WorkbenchWizard: React.FC<WorkbenchWizardProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];
  const StepIcon = step.icon;

  return (
    <div className="absolute inset-0 z-[60] pointer-events-none">
      <div className="absolute inset-0 bg-black/50 pointer-events-auto" onClick={onSkip} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="absolute pointer-events-auto"
          style={{
            top: step.position.top,
            left: step.position.left,
            right: step.position.right,
            bottom: step.position.bottom,
            transform: `translate(${step.position.x || 0}, ${step.position.y || 0})`,
          }}
        >
          <div className="bg-[#111] border border-white/20 rounded-xl p-6 w-80 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative">
            {step.arrow !== 'none' && (
              <div 
                className={`absolute w-4 h-4 bg-[#111] border border-white/20 transform ${
                  step.arrow === 'down' ? 'bottom-[-9px] left-1/2 -translate-x-1/2 rotate-[225deg] border-t-0 border-l-0 border-r border-b' :
                  step.arrow === 'up' ? 'top-[-9px] left-1/2 -translate-x-1/2 rotate-45 border-b-0 border-r-0 border-t border-l' :
                  step.arrow === 'left' ? 'left-[-9px] top-1/2 -translate-y-1/2 rotate-[-45deg] border-t-0 border-r-0' : ''
                }`}
              />
            )}

            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <StepIcon className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-xs font-bold text-blue-400 tracking-wide">
                  Step {currentStep + 1} / {STEPS.length}
                </span>
              </div>
              <button onClick={onSkip} className="text-white/20 hover:text-white transition-colors p-1 rounded hover:bg-white/5">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              {step.description}
            </p>

            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <div 
                  key={i}
                  className={`h-1 rounded-full transition-all ${
                    i === currentStep ? 'w-6 bg-blue-400' :
                    i < currentStep ? 'w-3 bg-white/40' : 'w-3 bg-white/10'
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-[11px] text-white/30 hover:text-white/60 transition-colors"
              >
                Skip tour
              </button>
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                {currentStep === STEPS.length - 1 ? "Get Started" : "Next"}
                {currentStep === STEPS.length - 1 ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};