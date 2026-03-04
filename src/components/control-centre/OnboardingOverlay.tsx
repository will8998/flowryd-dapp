"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Users, Workflow, Handshake, Rocket, X, ChevronRight } from 'lucide-react';

interface OnboardingOverlayProps {
  onComplete: () => void;
}

const STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Flowryd',
    description: 'Your Canton Network intelligence platform for institutional orchestration. Transform connections into automated workflows with our guided approach.',
    icon: Globe,
    cta: 'Begin Journey'
  },
  {
    id: 'discover',
    title: 'Discover Participants',
    description: 'Explore the Canton Network ecosystem. Find institutions, partners, and potential collaborators to build your multi-party workflows.',
    icon: Users,
    cta: 'Next Step'
  },
  {
    id: 'navigate',
    title: 'Build Workflows',
    description: 'Use our Flow Builder to drag participants and connect nodes. Create complex multi-party agreements with visual workflow design.',
    icon: Workflow,
    cta: 'Next Step'
  },
  {
    id: 'activate',
    title: 'Activate Deals',
    description: 'Deploy smart contracts and execute transactions. Create deal rooms where all parties can collaborate and finalize agreements.',
    icon: Handshake,
    cta: 'Next Step'
  },
  {
    id: 'start',
    title: 'Get Started',
    description: 'You\'re ready to harness the power of Canton Network. Choose how you\'d like to begin your institutional orchestration journey.',
    icon: Rocket,
    cta: 'Enter Platform'
  }
];

const QUICK_ACTIONS = [
  { label: 'View Intelligence', action: 'intelligence' },
  { label: 'Browse Participants', action: 'participants' },
  { label: 'Create Flow', action: 'create' }
];

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentStep === STEPS.length - 1) {
      onComplete();
    } else {
      setDirection(1);
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const handleQuickAction = (action: string) => {
    // For now, just complete onboarding - could extend to navigate to specific view
    onComplete();
  };

  const step = STEPS[currentStep];
  const isLastStep = currentStep === STEPS.length - 1;

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-lg mx-4 bg-zinc-950 border border-white/10 rounded-lg overflow-hidden shadow-2xl"
      >
        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 z-10 p-2 text-white/40 hover:text-white transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-white/5">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <div className="p-8 pt-12 pb-6">
          <div className="h-96 flex flex-col">
            {/* Step Content */}
            <div className="flex-1 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: "spring", stiffness: 300, damping: 30 },
                    opacity: { duration: 0.2 }
                  }}
                  className="flex flex-col items-center space-y-6 w-full"
                >
                  {/* Icon */}
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-white/70" />
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold text-white tracking-tight">
                    {step.title}
                  </h2>

                  {/* Description */}
                  <p className="text-white/60 text-sm leading-relaxed max-w-md px-4">
                    {step.description}
                  </p>

                  {/* Quick Actions - Only on last step */}
                  {isLastStep && (
                    <div className="flex flex-col gap-2 w-full max-w-xs mt-4">
                      {QUICK_ACTIONS.map((action, index) => (
                        <motion.button
                          key={action.action}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          onClick={() => handleQuickAction(action.action)}
                          className="px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded text-white/80 text-sm transition-all flex items-center justify-center gap-2 group"
                        >
                          <span>{action.label}</span>
                          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Progress Dots */}
            <div className="flex justify-center gap-2 mt-6">
              {STEPS.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentStep ? 'bg-white/70' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-8">
              <button
                onClick={handleNext}
                className="w-full py-4 bg-white hover:bg-white/90 text-zinc-950 rounded font-semibold transition-all flex items-center justify-center gap-3 group"
              >
                <span>{step.cta}</span>
                <motion.div
                  animate={{ x: [0, 4, 0] }}
                  transition={{ 
                    duration: 1.5, 
                    repeat: Infinity, 
                    ease: "easeInOut",
                    repeatDelay: 2 
                  }}
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.div>
              </button>
            </div>
          </div>
        </div>

        {/* Decorative Background Element */}
        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <step.icon className="w-32 h-32 text-white" />
        </div>
      </motion.div>
    </motion.div>
  );
};