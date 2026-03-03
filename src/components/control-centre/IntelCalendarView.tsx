'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { intelEvents as baseEvents, type IntelEvent } from '@/lib/canton-intel-data';

interface IntelCalendarViewProps {
  onEventSelect?: (event: IntelEvent) => void;
}

type CalendarView = 'month' | 'week' | 'agenda';

// Additional sample events for a richer calendar experience
const supplementaryEvents: IntelEvent[] = [
  {
    id: 'evt-2026-002',
    name: 'CfC St. Moritz 2026 Opening Ceremony',
    type: 'Conference' as const,
    startDate: '2026-01-15T08:00:00Z',
    endDate: '2026-01-15T10:00:00Z',
    location: 'St. Moritz, Switzerland',
    applicationRequired: true,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Don Wilson', 'Yuval Rooz'],
    cantonOrgIds: ['p_drw', 'p_digitalasset'],
    topicsCovered: ['Opening Keynote', 'Canton Vision 2026'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Official conference opening with key industry leaders'
  },
  {
    id: 'evt-2026-003',
    name: 'Canton Network Governance Workshop',
    type: 'Working Group' as const,
    startDate: '2026-02-10T14:00:00Z',
    endDate: '2026-02-10T17:00:00Z',
    location: 'Zurich, Switzerland',
    applicationRequired: false,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Amanda Martin', 'Talia Klein'],
    cantonOrgIds: ['p_globalsynchronizerfo', 'p_dtcc'],
    topicsCovered: ['Governance', 'CIP Process', 'Validator Management'],
    flowrydAttended: true,
    flowrydSpeaking: false,
    notes: 'Deep dive into Canton governance mechanisms'
  },
  {
    id: 'evt-2026-004',
    name: 'Digital Asset Regulation Forum',
    type: 'Summit' as const,
    startDate: '2026-03-05T09:00:00Z',
    endDate: '2026-03-06T18:00:00Z',
    location: 'London, United Kingdom',
    applicationRequired: true,
    cantonRelevance: 'Medium' as const,
    cantonSpeakerIds: ['Jenny Johnson', 'Jill Sommers'],
    cantonOrgIds: ['p_franklintempleton', 'p_cantonstrategicholdi'],
    topicsCovered: ['Regulatory Compliance', 'Institutional Adoption', 'ETFs'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Focus on regulatory landscape for digital assets'
  },
  {
    id: 'evt-2026-005',
    name: 'DTCC Canton Integration Demo',
    type: 'Industry Day' as const,
    startDate: '2026-03-18T10:00:00Z',
    endDate: '2026-03-18T16:00:00Z',
    location: 'New York, USA',
    applicationRequired: false,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Talia Klein'],
    cantonOrgIds: ['p_dtcc'],
    topicsCovered: ['Settlement', 'Clearing', 'Integration'],
    flowrydAttended: true,
    flowrydSpeaking: true,
    notes: 'Live demonstration of DTCC-Canton integration'
  },
  {
    id: 'evt-2026-006',
    name: 'Goldman Sachs Digital Assets Summit',
    type: 'Summit' as const,
    startDate: '2026-04-02T08:30:00Z',
    endDate: '2026-04-03T17:00:00Z',
    location: 'New York, USA',
    applicationRequired: true,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Yuval Rooz', 'Don Wilson'],
    cantonOrgIds: ['p_digitalasset', 'p_drw'],
    topicsCovered: ['Institutional Trading', 'Prime Brokerage', 'Custody'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Major Wall Street summit on digital asset infrastructure'
  },
  {
    id: 'evt-2026-007',
    name: 'Canton Network Q1 Validator Review',
    type: 'Working Group' as const,
    startDate: '2026-03-28T13:00:00Z',
    endDate: '2026-03-28T16:00:00Z',
    location: 'Virtual',
    applicationRequired: false,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Amanda Martin', 'Chris Matturri'],
    cantonOrgIds: ['p_globalsynchronizerfo', 'p_proofgroup'],
    topicsCovered: ['Validator Performance', 'Network Health', 'Q1 Review'],
    flowrydAttended: true,
    flowrydSpeaking: true,
    notes: 'Quarterly validator performance and network metrics review'
  },
  {
    id: 'evt-2026-008',
    name: 'Broadridge DLT Infrastructure Meeting',
    type: 'Industry Day' as const,
    startDate: '2026-02-22T11:00:00Z',
    endDate: '2026-02-22T15:00:00Z',
    location: 'Jersey City, USA',
    applicationRequired: true,
    cantonRelevance: 'Medium' as const,
    cantonSpeakerIds: ['Eric Saraniecki'],
    cantonOrgIds: ['p_digitalasset'],
    topicsCovered: ['DLT Infrastructure', 'Post-Trade', 'Settlement'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Broadridge DLR integration planning session'
  },
  {
    id: 'evt-2026-009',
    name: 'WEF Blockchain Policy Roundtable',
    type: 'Summit' as const,
    startDate: '2026-04-15T14:00:00Z',
    endDate: '2026-04-16T17:00:00Z',
    location: 'Geneva, Switzerland',
    applicationRequired: true,
    cantonRelevance: 'Medium' as const,
    cantonSpeakerIds: ['Yuval Rooz', 'Jill Sommers'],
    cantonOrgIds: ['p_digitalasset', 'p_cantonstrategicholdi'],
    topicsCovered: ['Policy', 'Global Standards', 'Central Bank Integration'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'World Economic Forum policy discussion on blockchain infrastructure'
  },
  {
    id: 'evt-2026-010',
    name: 'Talos Network Data Intelligence Launch',
    type: 'Industry Day' as const,
    startDate: '2026-02-28T12:00:00Z',
    endDate: '2026-02-28T18:00:00Z',
    location: 'London, United Kingdom',
    applicationRequired: false,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Anton Katz', 'Sydney Rice'],
    cantonOrgIds: ['p_talos'],
    topicsCovered: ['Network Analytics', 'Trading Intelligence', 'Market Data'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Launch of Talos enhanced Canton network intelligence platform'
  },
  {
    id: 'evt-2026-011',
    name: 'Canton Privacy Tech Deep Dive',
    type: 'Hackathon' as const,
    startDate: '2026-01-25T09:00:00Z',
    endDate: '2026-01-26T18:00:00Z',
    location: 'Berlin, Germany',
    applicationRequired: true,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Fernando Vázquez Cao', 'Norbert Vadas'],
    cantonOrgIds: ['p_chainlink', 'p_zenithzkcloud'],
    topicsCovered: ['Privacy Technology', 'ZK Proofs', 'Developer Tools'],
    flowrydAttended: true,
    flowrydSpeaking: true,
    notes: 'Technical hackathon focused on Canton privacy primitives'
  },
  {
    id: 'evt-2026-012',
    name: 'Copper Institutional Custody Summit',
    type: 'Conference' as const,
    startDate: '2026-04-08T08:00:00Z',
    endDate: '2026-04-09T17:00:00Z',
    location: 'London, United Kingdom',
    applicationRequired: true,
    cantonRelevance: 'High' as const,
    cantonSpeakerIds: ['Amar Kuchinad', 'Mark Wendland'],
    cantonOrgIds: ['p_copper', 'p_cantonstrategicholdi'],
    topicsCovered: ['Custody', 'Collateral Management', 'Institutional Infrastructure'],
    flowrydAttended: false,
    flowrydSpeaking: false,
    notes: 'Focus on institutional custody solutions for digital assets'
  }
];

const allEvents = [...baseEvents, ...supplementaryEvents];

// Event type to color mapping for Bloomberg Terminal aesthetic
const getEventColor = (type: IntelEvent['type']) => {
  switch (type) {
    case 'Conference':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'Summit':
      return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    case 'Working Group':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    case 'Industry Day':
      return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    case 'Hackathon':
      return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'Roadshow':
      return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30';
    default:
      return 'bg-white/10 text-white/60 border-white/20';
  }
};

const formatDateShort = (date: Date): string => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatTimeShort = (date: Date): string => {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false });
};

export default function IntelCalendarView({ onEventSelect }: IntelCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const calendarStart = new Date(monthStart);
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay());
  const calendarEnd = new Date(monthEnd);
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()));

  const eventsInView = useMemo(() => {
    if (view === 'agenda') {
      return allEvents
        .filter(event => new Date(event.startDate) >= new Date())
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    }

    const start = view === 'month' ? calendarStart : new Date(currentDate);
    const end = view === 'month' ? calendarEnd : new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);

    return allEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      return eventStart <= end && eventEnd >= start;
    });
  }, [view, currentDate, calendarStart, calendarEnd]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderMonthView = () => {
    const weeks = [];
    const current = new Date(calendarStart);
    const today = new Date();

    while (current <= calendarEnd) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(current);
        const dayEvents = eventsInView.filter(event => {
          const eventStart = new Date(event.startDate);
          const eventEnd = new Date(event.endDate);
          const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
          const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
          return eventStart <= dayEnd && eventEnd >= dayStart;
        });

        const isCurrentMonth = dayDate.getMonth() === currentDate.getMonth();
        const isToday = dayDate.toDateString() === today.toDateString();

        week.push(
          <div
            key={dayDate.toISOString()}
            className={`
              bg-black/30 border border-white/5 min-h-[80px] p-1 relative
              ${isCurrentMonth ? 'bg-black/30' : 'bg-black/10'}
              ${isToday ? 'border-emerald-500/30 bg-emerald-500/5' : ''}
              hover:bg-white/[0.02] transition-colors cursor-pointer
            `}
          >
            <div className={`text-[11px] font-mono mb-1 ${
              isCurrentMonth ? (isToday ? 'text-white font-bold' : 'text-white/40') : 'text-white/20'
            }`}>
              {dayDate.getDate()}
            </div>
            <div className="space-y-0.5">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={`${event.id}-${idx}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventSelect?.(event);
                  }}
                  className={`
                    px-1 py-0.5 rounded text-[9px] font-medium border cursor-pointer
                    hover:brightness-110 transition-all truncate
                    ${getEventColor(event.type)}
                  `}
                  title={`${event.name} - ${formatTimeShort(new Date(event.startDate))}`}
                >
                  {event.name}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="text-[8px] text-white/40 font-mono">
                  +{dayEvents.length - 3} more
                </div>
              )}
            </div>
          </div>
        );
        current.setDate(current.getDate() + 1);
      }
      weeks.push(
        <div key={weeks.length} className="grid grid-cols-7 gap-px">
          {week}
        </div>
      );
    }

    return (
      <div className="space-y-px">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-px mb-px">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="bg-black/50 p-2 text-center text-[10px] font-mono text-white/60 border border-white/10">
              {day}
            </div>
          ))}
        </div>
        {weeks}
      </div>
    );
  };

  const renderWeekView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Start from Monday
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    return (
      <div className="grid grid-cols-8 gap-px bg-black/20 border border-white/5">
        {/* Time column */}
        <div className="bg-black/50">
          <div className="h-10 border-b border-white/5"></div>
          {hours.map(hour => (
            <div key={hour} className="h-12 border-b border-white/5 p-1 text-[9px] font-mono text-white/20">
              {hour.toString().padStart(2, '0')}:00
            </div>
          ))}
        </div>
        
        {/* Day columns */}
        {Array.from({ length: 7 }, (_, i) => {
          const dayDate = new Date(weekStart);
          dayDate.setDate(weekStart.getDate() + i);
          const dayEvents = eventsInView.filter(event => {
            const eventStart = new Date(event.startDate);
            const eventEnd = new Date(event.endDate);
            const dayStart = new Date(dayDate.setHours(0, 0, 0, 0));
            const dayEnd = new Date(dayDate.setHours(23, 59, 59, 999));
            return eventStart <= dayEnd && eventEnd >= dayStart;
          });

          const isToday = dayDate.toDateString() === new Date().toDateString();

          return (
            <div key={i} className={`bg-black/30 ${isToday ? 'bg-emerald-500/5' : ''}`}>
              <div className={`h-10 border-b p-2 text-center text-[10px] font-mono ${
                isToday ? 'text-white font-bold' : 'text-white/60'
              }`}>
                {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <div className="relative">
                {hours.map(hour => (
                  <div key={hour} className="h-12 border-b border-white/5"></div>
                ))}
                {dayEvents.map((event, idx) => {
                  const startTime = new Date(event.startDate);
                  const endTime = new Date(event.endDate);
                  const startHour = startTime.getHours() + startTime.getMinutes() / 60;
                  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                  
                  return (
                    <div
                      key={`${event.id}-${idx}`}
                      onClick={() => onEventSelect?.(event)}
                      className={`
                        absolute left-1 right-1 rounded border cursor-pointer
                        hover:brightness-110 transition-all px-1 py-1
                        ${getEventColor(event.type)}
                      `}
                      style={{
                        top: `${startHour * 48}px`,
                        height: `${Math.max(duration * 48 - 2, 24)}px`,
                        zIndex: idx + 1
                      }}
                      title={`${event.name} - ${formatTimeShort(startTime)} to ${formatTimeShort(endTime)}`}
                    >
                      <div className="text-[9px] font-medium truncate">
                        {event.name}
                      </div>
                      <div className="text-[8px] opacity-80 truncate">
                        {formatTimeShort(startTime)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAgendaView = () => {
    const eventsByMonth = eventsInView.reduce((acc, event) => {
      const monthKey = new Date(event.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(event);
      return acc;
    }, {} as Record<string, IntelEvent[]>);

    return (
      <div className="space-y-6">
        {Object.entries(eventsByMonth).map(([month, events]) => (
          <div key={month} className="space-y-3">
            <div className="sticky top-0 bg-zinc-950 py-2 text-sm font-bold text-white/90 border-b border-white/10">
              {month}
            </div>
            <div className="space-y-2">
              {events.map(event => {
                const startDate = new Date(event.startDate);
                const endDate = new Date(event.endDate);
                
                return (
                  <div
                    key={event.id}
                    onClick={() => onEventSelect?.(event)}
                    className="bg-black/30 border border-white/5 rounded p-3 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[60px]">
                        <div className="text-white/90 font-mono text-sm">
                          {formatDateShort(startDate)}
                        </div>
                        <div className="text-white/40 font-mono text-xs">
                          {formatTimeShort(startDate)}
                        </div>
                        {startDate.toDateString() !== endDate.toDateString() && (
                          <div className="text-white/40 font-mono text-[10px] mt-1">
                            to {formatDateShort(endDate)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-white/90 text-sm">{event.name}</span>
                          <span className={`
                            px-2 py-0.5 rounded text-[10px] font-medium border
                            ${getEventColor(event.type)}
                          `}>
                            {event.type}
                          </span>
                        </div>
                        <div className="text-white/60 text-xs mb-1">
                          {event.location}
                        </div>
                        {event.topicsCovered.length > 0 && (
                          <div className="text-white/40 text-xs">
                            {event.topicsCovered.slice(0, 3).join(' · ')}
                            {event.topicsCovered.length > 3 && ' · ...'}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {event.flowrydAttended && (
                          <div className="px-2 py-1 bg-emerald-500/20 text-emerald-300 rounded text-[9px] font-mono">
                            ATTEND
                          </div>
                        )}
                        {event.flowrydSpeaking && (
                          <div className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded text-[9px] font-mono">
                            SPEAK
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full p-4 bg-zinc-950">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white/90">
              Intelligence Calendar
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => view === 'month' ? navigateMonth('prev') : navigateWeek('prev')}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-white/60" />
            </button>
            
            <div className="text-sm font-bold text-white/90 min-w-[140px] text-center">
              {view === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {view === 'week' && `Week of ${formatDateShort(new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000))}`}
              {view === 'agenda' && 'Upcoming Events'}
            </div>
            
            <button
              onClick={() => view === 'month' ? navigateMonth('next') : navigateWeek('next')}
              className="p-1 hover:bg-white/10 rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-mono text-white/80 transition-colors"
          >
            Today
          </button>
          
          <div className="flex bg-black/30 rounded overflow-hidden">
            {(['month', 'week', 'agenda'] as CalendarView[]).map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`
                  px-3 py-1 text-[11px] font-mono transition-colors
                  ${view === viewType 
                    ? 'bg-emerald-500/20 text-emerald-300' 
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                  }
                `}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'agenda' && renderAgendaView()}
        </motion.div>
      </AnimatePresence>

      {/* Event Stats */}
      <div className="mt-4 flex items-center gap-4 text-[11px] font-mono text-white/40">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          <span>{eventsInView.length} events</span>
        </div>
        <div>
          {eventsInView.filter(e => e.flowrydAttended).length} attending
        </div>
        <div>
          {eventsInView.filter(e => e.flowrydSpeaking).length} speaking
        </div>
      </div>
    </div>
  );
}