"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Check } from 'lucide-react';

interface WizardOverlayProps {
  onComplete: () => void;
  onSkip: () => void;
}

const STEPS = [
  {
    id: 'user-node',
    title: "Your Active Node",
    description: "This is your participant node, populated with real-time data from the Canton ledger.",
    position: { top: '50%', left: '50%', x: '-50%', y: '-160px' }, // Above center
    arrow: 'down'
  },
  {
    id: 'workflow',
    title: "Select a Workflow",
    description: "Filter the network by compatible financial workflows like Repo or Collateral Management.",
    position: { top: '140px', left: '50%', x: '-50%', y: '0' }, // Below top bar
    arrow: 'up'
  },
  {
    id: 'add-participant',
    title: "Find Counterparties",
    description: "Search the directory to find and connect with compatible partners.",
    position: { bottom: '160px', left: '50%', x: '-50%', y: '0' }, // Above bottom button
    arrow: 'down'
  },
  {
    id: 'impact-bar',
    title: "Track Network Value",
    description: "Watch your network centrality and collateral efficiency score grow in real-time.",
    position: { bottom: '100px', left: '50%', x: '-50%', y: '0' }, // Above dock
    arrow: 'down'
  }
];

export const WizardOverlay: React.FC<WizardOverlayProps> = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="absolute inset-0 z-50 pointer-events-none">
      {/* Dimmed Background with Hole - Simplified as just dimming for now, spotlight is hard without canvas coords */}
      <div className="absolute inset-0 bg-black/40 pointer-events-auto transition-colors duration-500" />

      <AnimatePresence mode="wait">
        <motion.div
          key={step.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="absolute pointer-events-auto"
          style={{
            top: step.position.top,
            left: step.position.left,
            bottom: step.position.bottom,
            transform: `translate(${step.position.x || 0}, ${step.position.y || 0})`
          }}
        >
          <div className="bg-[#111] border border-white/20 rounded-xl p-5 w-80 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
            {/* Arrow */}
            <div 
              className={`absolute w-4 h-4 bg-[#111] border-l border-t border-white/20 transform rotate-45 ${
                step.arrow === 'down' ? 'bottom-[-9px] left-1/2 -translate-x-1/2 rotate-[225deg]' :
                step.arrow === 'up' ? 'top-[-9px] left-1/2 -translate-x-1/2 rotate-45' : ''
              }`}
            />

            <div className="flex justify-between items-start mb-3">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                Step {currentStep + 1} / {STEPS.length}
              </div>
              <button onClick={onSkip} className="text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-white/60 mb-6 leading-relaxed">
              {step.description}
            </p>

            <div className="flex justify-end">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg font-bold text-xs hover:bg-gray-200 transition-colors"
              >
                {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                {currentStep === STEPS.length - 1 ? <Check className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

