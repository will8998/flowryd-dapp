"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Layers, Sparkles } from 'lucide-react';

import { NavigateHub } from './NavigateHub';
import type { Participant } from '@/lib/canton-data';

interface NavigatePathwaysProps {
  initialJumpCut?: { id: string; name: string; nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }> } | null;
  onJumpCutConsumed?: () => void;
  initialParticipant?: Participant | null;
  onParticipantConsumed?: () => void;
  onNavigateToTier?: (tier: string) => void;
  onBackToLibrary?: () => void;
}

export const NavigatePathways: React.FC<NavigatePathwaysProps> = ({ initialJumpCut, onJumpCutConsumed, initialParticipant, onParticipantConsumed, onNavigateToTier, onBackToLibrary }) => {
  const [selectedPathway, setSelectedPathway] = useState<'join' | 'build' | 'custom' | null>(initialJumpCut || initialParticipant ? 'build' : null);


  const pathways = [
    {
      key: 'join' as const,
      title: 'JOIN',
      subtitle: 'Join Existing Flow',
      description: 'Browse and join published workflows from the marketplace',
      icon: Users,
      accent: 'emerald-500'
    },
    {
      key: 'build' as const,
      title: 'BUILD',
      subtitle: 'Build from Template',
      description: 'Start with a proven workflow template and customize it',
      icon: Layers,
      accent: 'blue-500'
    },
    {
      key: 'custom' as const,
      title: 'CREATE CUSTOM',
      subtitle: 'Create Custom Flow',
      description: 'Design a completely new workflow from scratch',
      icon: Sparkles,
      accent: 'purple-500'
    }
  ];

  const renderPathwaySelector = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
      className="h-full flex flex-col items-center justify-center px-8"
    >
      {onBackToLibrary && (
        <button
          onClick={onBackToLibrary}
          className="absolute top-6 left-8 text-white/40 hover:text-white text-sm transition-colors duration-200"
        >
          ← Back to Library
        </button>
      )}
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-3xl font-bold text-white mb-4"
        >
          Choose Your Path
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-white/40 text-lg"
        >
          How would you like to navigate the Canton Network?
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pathways.map((pathway, i) => {
          const IconComponent = pathway.icon;
          return (
            <motion.div
              key={pathway.key}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 + 0.4, duration: 0.6 }}
              onClick={() => setSelectedPathway(pathway.key)}
              className="cursor-pointer"
            >
              <div className="p-10 space-y-6 border border-white/10 bg-black/30 rounded hover:border-white/30 transition-colors duration-300">
                <div className="w-16 h-16 rounded bg-white/10 flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-white/70" />
                </div>
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{pathway.title}</h3>
                    <h4 className="text-white/60 font-medium">{pathway.subtitle}</h4>
                  </div>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {pathway.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  useEffect(() => {
    if (selectedPathway === 'join' && onNavigateToTier) {
      onNavigateToTier('JOIN');
      setSelectedPathway(null);
    }
  }, [selectedPathway, onNavigateToTier]);

  const renderSelectedContent = () => {
    if (selectedPathway === 'join') {
      // Handled by useEffect above — navigates to CollectiveHub tier
      return null;
    }

    if (selectedPathway === 'build' || selectedPathway === 'custom') {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="h-full flex flex-col"
        >
          <button 
            onClick={() => {
              if ((initialJumpCut || initialParticipant) && onNavigateToTier) {
                onNavigateToTier('DISCOVER');
              } else {
                setSelectedPathway(null);
              }
            }}
            className="shrink-0 text-white/40 hover:text-white text-sm mb-4 text-left transition-colors duration-200"
          >
            ← {(initialJumpCut || initialParticipant) ? 'Back to Discover' : 'Back to Pathways'}
          </button>
          <div className="flex-1 min-h-0 overflow-hidden">
            <NavigateHub 
              initialJumpCut={initialJumpCut}
              onJumpCutConsumed={onJumpCutConsumed}
              initialParticipant={initialParticipant}
              onParticipantConsumed={onParticipantConsumed}
            />
          </div>
        </motion.div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-background text-white relative">
      <AnimatePresence mode="wait">
        {selectedPathway ? renderSelectedContent() : renderPathwaySelector()}
      </AnimatePresence>
    </div>
  );
};