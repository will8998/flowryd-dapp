"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, CheckCircle2, Target, Workflow, Zap, X } from 'lucide-react';

interface OnboardingWizardProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Mission Briefing',
    desc: 'Welcome to Flowryd. You are now at the helm of an institutional orchestration engine. Our goal: move from connection to live flow in 3 steps.',
    icon: Sparkles,
    action: 'Start Mission'
  },
  {
    id: 'discover',
    title: 'Step 1: DISCOVER',
    desc: 'Use the Network Grid to find institutional affinity. Identify 1st and 2nd degree partners already on Canton.',
    icon: Target,
    action: 'Next Step'
  },
  {
    id: 'navigate',
    title: 'Step 2: NAVIGATE',
    desc: 'Choose a proven Flow Template or build a custom multi-party workflow. This is where your strategy becomes a blueprint.',
    icon: Workflow,
    action: 'Next Step'
  },
  {
    id: 'activate',
    title: 'Step 3: ACTIVATE',
    desc: 'Deploy smart contracts, execute transactions, and earn FA rewards. Turn your blueprints into production revenue.',
    icon: Zap,
    action: 'Enter Control Centre'
  }
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      onComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const step = STEPS[currentStep];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0a0a0a] border border-blue-500/20 max-w-lg w-full rounded-[48px] p-12 relative overflow-hidden shadow-2xl"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <motion.div 
            className="h-full bg-blue-500" 
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        <div className="absolute top-6 right-10">
           <button onClick={onComplete} className="p-2 text-white/20 hover:text-white transition-colors">
             <X className="w-5 h-5" />
           </button>
        </div>

        <div className="space-y-8 text-center relative z-10">
           <div className="w-20 h-20 bg-blue-600/10 border border-blue-600/20 rounded-[28px] flex items-center justify-center mx-auto">
             <step.icon className="w-10 h-10 text-blue-500" />
           </div>

           <div className="space-y-3">
             <div className="flex justify-center gap-1">
               {STEPS.map((_, i) => (
                 <div key={i} className={`h-1 w-4 rounded-full transition-all ${i === currentStep ? 'bg-blue-500' : 'bg-white/10'}`} />
               ))}
             </div>
             <h2 className="text-3xl font-black italic font-mono uppercase tracking-tighter">{step.title}</h2>
             <p className="text-white/50 text-base leading-relaxed">{step.desc}</p>
           </div>

           <div className="pt-4">
              <button 
                onClick={handleNext}
                className="w-full py-5 bg-white text-black rounded-[24px] font-black italic font-mono text-lg hover:bg-blue-50 transition-all flex items-center justify-center gap-3 group"
              >
                {step.action}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {currentStep === 0 && (
                <p className="mt-4 text-[10px] text-white/20 uppercase tracking-widest font-bold">Estimated time to value: 45 seconds</p>
              )}
           </div>
        </div>

        <div className="absolute bottom-0 right-0 p-8 opacity-5">
           <step.icon className="w-32 h-32" />
        </div>
      </motion.div>
    </div>
  );
};
