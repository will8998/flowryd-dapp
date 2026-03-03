'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Calendar, Newspaper, Users, Monitor, Megaphone, ScrollText, ChevronRight, ChevronLeft, ChevronDown } from 'lucide-react';
import IntelGlobe from './IntelGlobe';
import IntelEventsView from './IntelEventsView';
import IntelMediaView from './IntelMediaView';
import IntelPeopleView from './IntelPeopleView';
import IntelMonitorView from './IntelMonitorView';
import IntelAnnouncementsView from './IntelAnnouncementsView';
import IntelCIPView from './IntelCIPView';
import IntelBottomPanel from './IntelBottomPanel';
import IntelDetailPanel from './IntelDetailPanel';
import IntelNewsFeed from './IntelNewsFeed';
import IntelBriefPanel from './IntelBriefPanel';
import { participants, type Participant } from '@/lib/canton-data';
import {
  intelEvents,
  intelMedia,
  intelPeople,
  intelAnnouncements,
  cipRegistry,
  type IntelEvent,
  type IntelPerson,
  type IntelMedia,
  type IntelAnnouncement,
  type CIPRecord,
} from '@/lib/canton-intel-data';

type IntelTab = 'map' | 'events' | 'media' | 'people' | 'monitor' | 'announcements' | 'cip';

const TABS: { id: IntelTab; label: string; icon: React.ElementType; count?: number }[] = [
  { id: 'map', label: 'Map', icon: Globe },
  { id: 'events', label: 'Events', icon: Calendar },
  { id: 'media', label: 'Media', icon: Newspaper },
  { id: 'people', label: 'People', icon: Users },
  { id: 'announcements', label: 'Announcements', icon: Megaphone },
  { id: 'cip', label: 'CIP Registry', icon: ScrollText },
  { id: 'monitor', label: 'Monitor', icon: Monitor },
];

export default function IntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<IntelTab>('map');
  const [showPanel, setShowPanel] = useState(false);
  const [showBottomPanel, setShowBottomPanel] = useState(true);

  // Selection state for detail panel
  const [selectedEvent, setSelectedEvent] = useState<IntelEvent | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<IntelPerson | null>(null);
  const [selectedMedia, setSelectedMedia] = useState<IntelMedia | null>(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<IntelAnnouncement | null>(null);
  const [selectedCIP, setSelectedCIP] = useState<CIPRecord | null>(null);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);

  // Collapsible sections state
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set(['events', 'media', 'people', 'announcements', 'cip']));

  // Refs for scroll navigation
  const sectionRefs = useRef<Record<IntelTab, HTMLElement | null>>({
    map: null, events: null, media: null, people: null,
    monitor: null, announcements: null, cip: null,
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
      announcements: intelAnnouncements.length,
      cip: cipRegistry.length,
    };
  }, []);

  const tabCounts: Record<IntelTab, number | undefined> = {
    map: stats.mapped,
    events: stats.events,
    media: stats.media,
    people: stats.people,
    announcements: stats.announcements,
    cip: stats.cip,
    monitor: undefined,
  };

  // Selection handlers
  const handleSelectEvent = (event: IntelEvent) => {
    setSelectedEvent(event);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setShowPanel(true);
  };

  const handleSelectPerson = (person: IntelPerson) => {
    setSelectedPerson(person);
    setSelectedEvent(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setShowPanel(true);
  };

  const handleSelectMedia = (media: IntelMedia) => {
    setSelectedMedia(media);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setShowPanel(true);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
  };


  const handleSelectAnnouncement = (announcement: IntelAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedCIP(null);
    setShowPanel(true);
  };

  const handleSelectCIP = (cip: CIPRecord) => {
    setSelectedCIP(cip);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setShowPanel(true);
  };
  const handleTabChange = (tab: IntelTab) => {
    setActiveTab(tab);
    const el = sectionRefs.current[tab];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toggleSection = useCallback((id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Section header component
  const SectionHeader = ({ id, icon: Icon, label, count, color }: {
    id: string; icon: React.ElementType; label: string; count?: number; color: string;
  }) => {
    const isCollapsed = collapsedSections.has(id);
    return (
      <button
        onClick={() => toggleSection(id)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-black/40 border-y border-white/5 hover:bg-black/50 transition-colors group"
      >
        <Icon className={`w-4 h-4 ${color}`} />
        <span className="text-[10px] font-bold font-mono tracking-[0.2em] text-white/50 group-hover:text-white/70">
          {label}
        </span>
        {count !== undefined && (
          <span className="text-[9px] font-mono text-white/25">{count}</span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-white/20 ml-auto transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
      </button>
    );
  };
  return (
    <motion.div
      ref={scrollContainerRef}
      className="relative w-full bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Sticky Tab Bar ── */}
      <div className="sticky top-0 z-30 flex items-center gap-1 p-1.5 px-3 bg-black/80 backdrop-blur-xl border-b border-white/5">
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
                  ? 'border border-white/30 bg-white/5 text-white'
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

      {/* ── Globe Section ── */}
      <section ref={(el) => { sectionRefs.current.map = el; }} id="section-map" className="relative h-[60vh] min-h-[400px]">
        <IntelGlobe
          onSelectParticipant={(p: Participant) => setSelectedParticipantId(p.id)}
          selectedParticipantId={selectedParticipantId ?? undefined}
          events={intelEvents}
          onSelectEvent={handleSelectEvent}
        />
      </section>

      {/* ── 3-Column Grid (News | Monitor | Intel Brief) ── */}
      <section className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] border-t border-white/5 h-[480px]">
        <div className="border-r border-white/5 overflow-y-auto">
          <IntelNewsFeed />
        </div>
        <div ref={(el) => { sectionRefs.current.monitor = el; }} id="section-monitor" className="border-r border-white/5 overflow-y-auto">
          <IntelMonitorView />
        </div>
        <div className="overflow-y-auto">
          <IntelBriefPanel />
        </div>
      </section>

      {/* ── Events Section ── */}
      <section ref={(el) => { sectionRefs.current.events = el; }} id="section-events">
        <SectionHeader id="events" icon={Calendar} label="EVENTS" count={stats.events} color="text-amber-400/60" />
        {!collapsedSections.has('events') && (
          <IntelEventsView onSelectEvent={handleSelectEvent} />
        )}
      </section>

      {/* ── Media Section ── */}
      <section ref={(el) => { sectionRefs.current.media = el; }} id="section-media">
        <SectionHeader id="media" icon={Newspaper} label="MEDIA" count={stats.media} color="text-emerald-400/60" />
        {!collapsedSections.has('media') && (
          <IntelMediaView onSelectMedia={handleSelectMedia} />
        )}
      </section>

      {/* ── People Section ── */}
      <section ref={(el) => { sectionRefs.current.people = el; }} id="section-people">
        <SectionHeader id="people" icon={Users} label="PEOPLE" count={stats.people} color="text-cyan-400/60" />
        {!collapsedSections.has('people') && (
          <IntelPeopleView onSelectPerson={handleSelectPerson} />
        )}
      </section>

      {/* ── Announcements Section ── */}
      <section ref={(el) => { sectionRefs.current.announcements = el; }} id="section-announcements">
        <SectionHeader id="announcements" icon={Megaphone} label="ANNOUNCEMENTS" count={stats.announcements} color="text-purple-400/60" />
        {!collapsedSections.has('announcements') && (
          <IntelAnnouncementsView onSelectAnnouncement={handleSelectAnnouncement} />
        )}
      </section>

      {/* ── CIP Registry Section ── */}
      <section ref={(el) => { sectionRefs.current.cip = el; }} id="section-cip">
        <SectionHeader id="cip" icon={ScrollText} label="CIP REGISTRY" count={stats.cip} color="text-orange-400/60" />
        {!collapsedSections.has('cip') && (
          <IntelCIPView onSelectCIP={handleSelectCIP} />
        )}
      </section>

      {/* ── Bottom Panel (kept per user request) ── */}
      <IntelBottomPanel
        isOpen={showBottomPanel}
        onToggle={() => setShowBottomPanel(!showBottomPanel)}
        activeTab={activeTab}
        onSelectEvent={handleSelectEvent}
        onSelectMedia={handleSelectMedia}
      />

      {/* ── Stats Bar ── */}
      <div className="h-8 bg-black/60 backdrop-blur-sm border-t border-white/5 flex items-center px-4 z-10">
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
          <span className="text-white/10 mx-3">·</span>
          <span className="text-purple-400/40">{stats.announcements} Announcements</span>
          <span className="text-white/10 mx-3">·</span>
          <span className="text-orange-400/40">{stats.cip} CIPs</span>
        </div>
      </div>

      {/* ── Detail Panel (Fixed Overlay) ── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            className="fixed top-16 right-0 bottom-0 w-80 bg-black/80 backdrop-blur-xl border-l border-white/5 z-40 overflow-y-auto"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
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
        className="fixed top-20 z-50 w-6 h-12 bg-black/60 border border-white/10 rounded-l flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-black/80 transition-all"
        animate={{ right: showPanel ? 320 : 0 }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {showPanel ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </motion.button>
    </motion.div>
  );
}
