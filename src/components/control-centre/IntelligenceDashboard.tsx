'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Calendar, Newspaper, Users, Monitor, ChevronRight, ChevronLeft } from 'lucide-react';
import IntelGlobe from './IntelGlobe';
import IntelEventsView from './IntelEventsView';
import IntelMediaView from './IntelMediaView';
import IntelPeopleView from './IntelPeopleView';
import IntelMonitorView from './IntelMonitorView';
import IntelBottomPanel from './IntelBottomPanel';
import IntelDetailPanel from './IntelDetailPanel';
import { participants, type Participant } from '@/lib/canton-data';
import {
  intelEvents,
  intelMedia,
  intelPeople,
  type IntelEvent,
  type IntelPerson,
  type IntelMedia,
} from '@/lib/canton-intel-data';

type IntelTab = 'map' | 'events' | 'media' | 'people' | 'monitor';

const TABS: { id: IntelTab; label: string; icon: React.ElementType; count?: number }[] = [
  { id: 'map', label: 'Map', icon: Globe },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'media', label: 'Media', icon: Newspaper },
  { id: 'people', label: 'People', icon: Users },
  { id: 'monitor', label: 'Monitor', icon: Monitor },
];

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<IntelTab>('map');
  const [showPanel, setShowPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(true);

  // Selection state for detail panel
  const [selectedEvent, setSelectedEvent] = useState<IntelEvent | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<IntelPerson | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<IntelMedia | null>(null);
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
      events: intelEvents.length,
      media: intelMedia.length,
      people: intelPeople.length,
    };
  }, []);

  const tabCounts: Record<IntelTab, number | undefined> = {
    map: stats.mapped,
    events: stats.events,
    media: stats.media,
    people: stats.people,
    monitor: undefined,
  };

  // Selection handlers
  const handleSelectEvent = (event: IntelEvent) => {
    setSelectedEvent(event);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setShowPanel(true);
  };

  const handleSelectPerson = (person: IntelPerson) => {
    setSelectedPerson(person);
    setSelectedEvent(null);
    setSelectedMedia(null);
    setShowPanel(true);
  };

  const handleSelectMedia = (media: IntelMedia) => {
    setSelectedMedia(media);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setShowPanel(true);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
  };

  const handleTabChange = (tab: IntelTab) => {
    setActiveTab(tab);
    // Clear selection when switching tabs
    handleCloseDetail();
  };

  return (
    <motion.div
      className="relative w-full h-full bg-zinc-950 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Tab Bar (top-left, floating over content) ── */}
      <div className="absolute top-3 left-3 z-20 flex gap-1 p-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-lg">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all
                ${isActive
                  ? 'border border-white/30 bg-black/40 text-white'
                  : 'text-white/40 hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="font-mono tracking-wide">{tab.label}</span>
              {tabCounts[tab.id] !== undefined && (
                <span className={`text-[8px] font-mono ${isActive ? 'text-white/50' : 'text-white/20'}`}>
                  {tabCounts[tab.id]}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 relative min-h-0 flex">
        {/* Main view */}
        <div className={`flex-1 relative min-w-0 ${showPanel ? '' : ''}`}>
          <AnimatePresence mode="wait">
            {activeTab === 'map' && (
              <motion.div
                key="map"
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <IntelGlobe
                  onSelectParticipant={(p: Participant) => setSelectedParticipantId(p.id)}
                  selectedParticipantId={selectedParticipantId ?? undefined}
                  events={intelEvents}
                  onSelectEvent={handleSelectEvent}
                />
              </motion.div>
            )}

            {activeTab === 'events' && (
              <motion.div
                key="events"
                className="absolute inset-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <IntelEventsView onSelectEvent={handleSelectEvent} />
              </motion.div>
            )}

            {activeTab === 'media' && (
              <motion.div
                key="media"
                className="absolute inset-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <IntelMediaView onSelectMedia={handleSelectMedia} />
              </motion.div>
            )}

            {activeTab === 'people' && (
              <motion.div
                key="people"
                className="absolute inset-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <IntelPeopleView onSelectPerson={handleSelectPerson} />
              </motion.div>
            )}

            {activeTab === 'monitor' && (
              <motion.div
                key="monitor"
                className="absolute inset-0"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <IntelMonitorView />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right Panel (news feed / detail) ── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              className="w-80 bg-black/60 backdrop-blur-md border-l border-white/5 z-10 flex-shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            >
              <IntelDetailPanel
                selectedEvent={selectedEvent}
                selectedPerson={selectedPerson}
                selectedMedia={selectedMedia}
                onClose={handleCloseDetail}
                onSelectPerson={handleSelectPerson}
                onSelectEvent={handleSelectEvent}
                onSelectMedia={handleSelectMedia}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toggle panel button */}
        <motion.button
          onClick={() => setShowPanel(!showPanel)}
          className="absolute top-4 z-20 w-6 h-12 bg-black/60 border border-white/10 rounded-l flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-black/80 transition-all"
          animate={{ right: showPanel ? 320 : 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        >
          {showPanel ? (
            <ChevronRight className="w-3 h-3" />
          ) : (
            <ChevronLeft className="w-3 h-3" />
          )}
        </motion.button>
      </div>

      {/* ── Bottom Panel ── */}
      <IntelBottomPanel
        isOpen={showBottomPanel}
        onToggle={() => setShowBottomPanel(!showBottomPanel)}
        activeTab={activeTab}
        onSelectEvent={handleSelectEvent}
        onSelectMedia={handleSelectMedia}
      />

      {/* ── Stats Bar ── */}
      <div className="h-8 bg-black/60 backdrop-blur-sm border-t border-white/5 flex items-center px-4 z-10 flex-shrink-0">
        <div className="flex items-center text-[9px] font-mono text-white/30 tracking-wide">
          <span>{stats.total} Participants</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.mapped} Mapped</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.validators} Validators</span>
          <span className="text-white/10 mx-3">·</span>
          <span>{stats.superValidators} Super Validators</span>
          <span className="text-white/10 mx-3">·</span>
          <span className="text-amber-400/40">{stats.events} Events</span>
          <span className="text-white/10 mx-3">·</span>
          <span className="text-emerald-400/40">{stats.media} Media</span>
          <span className="text-white/10 mx-3">·</span>
          <span className="text-cyan-400/40">{stats.people} People</span>
        </div>
      </div>
    </motion.div>
  );
}
