'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import { 
  Globe, Calendar, Users, Monitor, 
  ChevronRight, ChevronLeft, ChevronDown, TrendingUp, GitBranch, 
  CalendarDays, Film, Bell, FileText
} from 'lucide-react';
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
import { ErrorBoundary } from './ErrorBoundary';

// Dynamic imports for new components (SSR-safe)
const IntelMarketTicker = dynamic(() => import('./IntelMarketTicker'), { ssr: false });
const IntelCalendarView = dynamic(() => import('./IntelCalendarView'), { ssr: false });
const IntelRelationshipGraph = dynamic(() => import('./IntelRelationshipGraph'), { ssr: false });

type IntelTab = 'map' | 'markets' | 'calendar' | 'graph' | 'events' | 'media' | 'people' | 'announcements' | 'cip' | 'monitor';

const TABS: { id: IntelTab; label: string; icon: React.ElementType; count?: number }[] = [
  { id: 'map', label: 'Map', icon: Globe },
  { id: 'markets', label: 'Markets', icon: TrendingUp },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'graph', label: 'Graph', icon: GitBranch },
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'media', label: 'Media', icon: Film },
  { id: 'people', label: 'People', icon: Users },
  { id: 'announcements', label: 'Announcements', icon: Bell },
  { id: 'cip', label: 'CIP', icon: FileText },
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

  // Derive the full participant object from selectedParticipantId
  const selectedParticipant = useMemo(() => {
    if (!selectedParticipantId) return null;
    return participants.find(p => p.id === selectedParticipantId) ?? null;
  }, [selectedParticipantId]);

  // Collapsible sections state - calendar and graph start expanded (new features to showcase)
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    new Set(['events', 'media', 'people', 'announcements', 'cip'])
  );

  // Refs for scroll navigation
  const sectionRefs = useRef<Record<IntelTab, HTMLElement | null>>({
    map: null, 
    markets: null,
    calendar: null,
    graph: null,
    events: null, 
    media: null, 
    people: null,
    monitor: null, 
    announcements: null, 
    cip: null,
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
    markets: undefined,
    calendar: stats.events,
    graph: stats.total,
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
    setSelectedParticipantId(null);
    setShowPanel(true);
  };

  const handleSelectPerson = (person: IntelPerson) => {
    setSelectedPerson(person);
    setSelectedEvent(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setSelectedParticipantId(null);
    setShowPanel(true);
  };

  const handleSelectMedia = (media: IntelMedia) => {
    setSelectedMedia(media);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setSelectedParticipantId(null);
    setShowPanel(true);
  };

  const handleSelectAnnouncement = (announcement: IntelAnnouncement) => {
    setSelectedAnnouncement(announcement);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedCIP(null);
    setSelectedParticipantId(null);
    setShowPanel(true);
  };

  const handleSelectCIP = (cip: CIPRecord) => {
    setSelectedCIP(cip);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedParticipantId(null);
    setShowPanel(true);
  };

  const handleCloseDetail = () => {
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
    setSelectedParticipantId(null);
    setShowPanel(false);
  };

  const handleSelectParticipant = (p: Participant) => {
    setSelectedParticipantId(p.id);
    setSelectedEvent(null);
    setSelectedPerson(null);
    setSelectedMedia(null);
    setSelectedAnnouncement(null);
    setSelectedCIP(null);
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

  // Bloomberg Terminal-style section header component
  const SectionHeader = ({ id, icon: Icon, label, count, color }: {
    id: string; icon: React.ElementType; label: string; count?: number; color: string;
  }) => {
    const isCollapsed = collapsedSections.has(id);
    return (
      <button
        onClick={() => toggleSection(id)}
        className="flex items-center justify-between px-4 py-3 bg-black/40 border border-white/5 cursor-pointer hover:bg-white/[0.02] rounded-lg transition-colors group w-full"
      >
        <div className="flex items-center gap-3">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-white/60 group-hover:text-white/80">
            {label}
          </span>
          {count !== undefined && (
            <span className="text-[9px] font-mono text-white/30 bg-white/5 rounded px-1.5 py-0.5">{count}</span>
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
      </button>
    );
  };

  const getCurrentTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <motion.div
      ref={scrollContainerRef}
      className="relative w-full bg-zinc-950"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* ── Market Ticker (Sticky Top) ── */}
      <div className="sticky top-0 z-40">
        <IntelMarketTicker />
      </div>

      {/* ── Enhanced Tab Bar (Sticky Below Ticker) ── */}
      <div className="sticky top-8 z-30 bg-zinc-950/95 backdrop-blur-sm border-b border-white/5">
        <div className="flex items-center gap-1 p-1.5 px-3">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded text-[10px] font-mono uppercase tracking-wider transition-all
                  ${isActive
                    ? 'text-white border-b-2 border-emerald-500 bg-white/5'
                    : 'text-white/40 hover:text-white/60'
                  }
                `}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tabCounts[tab.id] !== undefined && (
                  <span className={`text-[8px] font-mono ${isActive ? 'text-white/50' : 'text-white/20'}`}>
                    {tabCounts[tab.id]}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3D Globe Section (60vh) ── */}
      <section 
        ref={(el) => { sectionRefs.current.map = el; }} 
        id="section-map" 
        className="relative h-[60vh] min-h-[400px]"
      >
        <ErrorBoundary label="3D Globe">
        <IntelGlobe
          onSelectParticipant={handleSelectParticipant}
          selectedParticipantId={selectedParticipantId ?? undefined}
          events={intelEvents}
          onSelectEvent={handleSelectEvent}
          onSelectPerson={handleSelectPerson}
          onSelectAnnouncement={handleSelectAnnouncement}
        />
        </ErrorBoundary>
      </section>

      {/* ── Bloomberg Bento Grid (News | Monitor | Intel Brief) ── */}
      <section className="grid grid-cols-12 gap-px bg-zinc-800 p-px rounded-lg overflow-hidden">
        <div className="col-span-4 h-[480px] bg-black overflow-y-auto">
          <IntelNewsFeed />
        </div>
        <div 
          ref={(el) => { sectionRefs.current.monitor = el; }} 
          id="section-monitor" 
          className="col-span-4 h-[480px] bg-black overflow-y-auto"
        >
          <IntelMonitorView />
        </div>
        <div className="col-span-4 h-[480px] bg-black overflow-y-auto">
          <IntelBriefPanel />
        </div>
      </section>

      {/* ── Calendar Section (Expanded by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.calendar = el; }} 
        id="section-calendar" 
        className="mt-8"
      >
        <SectionHeader 
          id="calendar" 
          icon={Calendar} 
          label="CALENDAR" 
          count={stats.events} 
          color="text-cyan-400/60" 
        />
        {!collapsedSections.has('calendar') && (
          <div className="mt-2">
            <IntelCalendarView onEventSelect={handleSelectEvent} />
          </div>
        )}
      </section>

      {/* ── Relationship Graph Section (Expanded by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.graph = el; }} 
        id="section-graph" 
        className="mt-6"
      >
        <SectionHeader 
          id="graph" 
          icon={GitBranch} 
          label="RELATIONSHIP GRAPH" 
          count={stats.total} 
          color="text-violet-400/60" 
        />
        {!collapsedSections.has('graph') && (
          <div className="mt-2">
            <ErrorBoundary label="Relationship Graph">
            <IntelRelationshipGraph 
              onNodeSelect={(node) => {
                if (node.type === 'Person' && node.data) {
                  handleSelectPerson(node.data as IntelPerson);
                } else if (node.type === 'Event' && node.data) {
                  handleSelectEvent(node.data as IntelEvent);
                } else if (node.type === 'Media' && node.data) {
                  handleSelectMedia(node.data as IntelMedia);
                } else if (node.type === 'Organization' && node.data) {
                  const org = node.data as Participant;
                  setSelectedParticipantId(org.id);
                  setSelectedEvent(null);
                  setSelectedPerson(null);
                  setSelectedMedia(null);
                  setSelectedAnnouncement(null);
                  setSelectedCIP(null);
                  setShowPanel(true);
                }
              }}
              height={500}
            />
            </ErrorBoundary>
          </div>
        )}
      </section>

      {/* ── Events Section (Collapsed by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.events = el; }} 
        id="section-events" 
        className="mt-6"
      >
        <SectionHeader 
          id="events" 
          icon={CalendarDays} 
          label="EVENTS" 
          count={stats.events} 
          color="text-amber-400/60" 
        />
        {!collapsedSections.has('events') && (
          <div className="mt-2">
            <IntelEventsView onSelectEvent={handleSelectEvent} />
          </div>
        )}
      </section>

      {/* ── Media Section (Collapsed by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.media = el; }} 
        id="section-media" 
        className="mt-6"
      >
        <SectionHeader 
          id="media" 
          icon={Film} 
          label="MEDIA" 
          count={stats.media} 
          color="text-emerald-400/60" 
        />
        {!collapsedSections.has('media') && (
          <div className="mt-2">
            <IntelMediaView onSelectMedia={handleSelectMedia} />
          </div>
        )}
      </section>

      {/* ── People Section (Collapsed by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.people = el; }} 
        id="section-people" 
        className="mt-6"
      >
        <SectionHeader 
          id="people" 
          icon={Users} 
          label="PEOPLE" 
          count={stats.people} 
          color="text-cyan-400/60" 
        />
        {!collapsedSections.has('people') && (
          <div className="mt-2">
            <IntelPeopleView onSelectPerson={handleSelectPerson} />
          </div>
        )}
      </section>

      {/* ── Announcements Section (Collapsed by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.announcements = el; }} 
        id="section-announcements" 
        className="mt-6"
      >
        <SectionHeader 
          id="announcements" 
          icon={Bell} 
          label="ANNOUNCEMENTS" 
          count={stats.announcements} 
          color="text-purple-400/60" 
        />
        {!collapsedSections.has('announcements') && (
          <div className="mt-2">
            <IntelAnnouncementsView onSelectAnnouncement={handleSelectAnnouncement} />
          </div>
        )}
      </section>

      {/* ── CIP Registry Section (Collapsed by default) ── */}
      <section 
        ref={(el) => { sectionRefs.current.cip = el; }} 
        id="section-cip" 
        className="mt-6"
      >
        <SectionHeader 
          id="cip" 
          icon={FileText} 
          label="CIP REGISTRY" 
          count={stats.cip} 
          color="text-orange-400/60" 
        />
        {!collapsedSections.has('cip') && (
          <div className="mt-2">
            <IntelCIPView onSelectCIP={handleSelectCIP} />
          </div>
        )}
      </section>

      {/* ── Bottom Panel (kept per user request) ── */}
      <div className="mt-8">
        <IntelBottomPanel
          isOpen={showBottomPanel}
          onToggle={() => setShowBottomPanel(!showBottomPanel)}
          activeTab={activeTab}
          onSelectEvent={handleSelectEvent}
          onSelectMedia={handleSelectMedia}
        />
      </div>

      {/* ── Status Bar ── */}
      <div className="h-8 bg-black border-t border-white/5 flex items-center px-4 text-[9px] font-mono text-white/20">
        <div className="flex items-center gap-3">
          <span className="text-white/40 uppercase tracking-wider">CANTON INTELLIGENCE</span>
          <span className="text-white/10">·</span>
          <span>{stats.total} NODES</span>
          <span className="text-white/10">·</span>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
            <span className="text-emerald-400/60">LIVE</span>
          </div>
          <span className="text-white/10">·</span>
          <span>{getCurrentTimestamp()}</span>
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
              selectedAnnouncement={selectedAnnouncement}
              selectedCIP={selectedCIP}
              selectedParticipant={selectedParticipant}
              onClose={handleCloseDetail}
              onSelectPerson={handleSelectPerson}
              onSelectEvent={handleSelectEvent}
              onSelectMedia={handleSelectMedia}
              onSelectParticipant={handleSelectParticipant}
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