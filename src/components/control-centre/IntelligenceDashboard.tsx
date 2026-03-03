'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import IntelMap from './IntelMap';
import IntelNewsFeed from './IntelNewsFeed';
import { participants, type Participant } from '@/lib/canton-data';

export default function IntelligenceDashboard() {
  const [showNews, setShowNews] = useState(true);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  const stats = useMemo(() => {
    const withCoords = participants.filter(p => p.lat != null && p.lng != null);
    const validators = participants.filter(p => p.validatorNodes && p.validatorNodes > 0);
    const superValidators = participants.filter(p => p.superValidator);
    
    return {
      total: participants.length,
      mapped: withCoords.length,
      validators: validators.length,
      superValidators: superValidators.length,
    };
  }, []);

  return (
    <motion.div 
      className="relative w-full h-full bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Map — full bleed */}
      <IntelMap
        onSelectParticipant={(p: Participant) => setSelectedParticipantId(p.id)}
        selectedParticipantId={selectedParticipantId ?? undefined}
      />

      {/* News panel — right overlay */}
      <AnimatePresence>
        {showNews && (
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-80 bg-black/60 backdrop-blur-md border-l border-white/5 z-10"
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <IntelNewsFeed />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        onClick={() => setShowNews(!showNews)}
        className="absolute top-4 z-20 w-6 h-12 bg-black/60 border border-white/10 rounded-l flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-black/80 transition-all"
        animate={{ right: showNews ? 320 : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {showNews ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </motion.button>

      {/* Stats bar — bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-black/60 backdrop-blur-sm border-t border-white/5 flex items-center px-4 z-10">
        <div className="flex items-center text-[9px] font-mono text-white/30 tracking-wide">
          <span>{stats.total} Participants</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.mapped} Mapped</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.validators} Validators</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.superValidators} Super Validators</span>
        </div>
      </div>
    </motion.div>
  );
}