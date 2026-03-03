'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Calendar, Newspaper, MapPin, Users, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  intelEvents,
  intelMedia,
  intelPeople,
  type IntelEvent,
  type IntelMedia,
  getPersonById,
  getPeopleForEvent,
} from '@/lib/canton-intel-data';

interface IntelBottomPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: 'map' | 'events' | 'media' | 'people' | 'monitor' | 'announcements' | 'cip';
  onSelectEvent?: (event: IntelEvent) => void;
  onSelectMedia?: (media: IntelMedia) => void;
}

const formatDateShort = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${s.getDate()}-${e.getDate()}, ${s.getFullYear()}`;
};

function EventCard({ event, onClick }: { event: IntelEvent; onClick?: () => void }) {
  const speakers = getPeopleForEvent(event.id);
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-72 bg-black/40 border border-white/5 rounded-lg p-3 hover:border-white/10 hover:bg-black/50 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-amber-400/60" />
          <span className="text-[10px] font-mono text-amber-400/60">{event.type.toUpperCase()}</span>
        </div>
        <Badge variant={event.cantonRelevance === 'High' ? 'warning' : event.cantonRelevance === 'Medium' ? 'info' : 'default'}>
          {event.cantonRelevance}
        </Badge>
      </div>
      <h4 className="text-xs font-bold text-white/80 group-hover:text-white mb-1 line-clamp-1">
        {event.name}
      </h4>
      <div className="flex items-center gap-3 text-[9px] text-white/30 font-mono">
        <span className="flex items-center gap-1">
          <Clock className="w-2.5 h-2.5" />
          {formatDateRange(event.startDate, event.endDate)}
        </span>
        <span className="flex items-center gap-1">
          <MapPin className="w-2.5 h-2.5" />
          {event.location.split(',')[0]}
        </span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Users className="w-2.5 h-2.5 text-white/20" />
        <span className="text-[9px] text-white/20 font-mono">{speakers.length} speakers</span>
        {event.attendeeCap && (
          <>
            <span className="text-white/10 mx-1">·</span>
            <span className="text-[9px] text-white/20 font-mono">{event.attendeeCap} cap</span>
          </>
        )}
      </div>
    </button>
  );
}

function MediaCard({ media, onClick }: { media: IntelMedia; onClick?: () => void }) {
  const firstSpeaker = media.cantonSpeakerIds[0] ? getPersonById(media.cantonSpeakerIds[0]) : null;
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 w-64 bg-black/40 border border-white/5 rounded-lg p-3 hover:border-white/10 hover:bg-black/50 transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40">
          {media.publisher}
        </span>
        <Badge variant={media.sentiment === 'Bullish' ? 'success' : media.sentiment === 'Bearish' ? 'danger' : 'default'}>
          {media.sentiment}
        </Badge>
      </div>
      <h4 className="text-xs font-bold text-white/80 group-hover:text-white mb-1 line-clamp-2">
        {media.title}
      </h4>
      <div className="flex items-center gap-2 text-[9px] text-white/30 font-mono">
        <span>{media.mediaType}</span>
        <span className="text-white/10">·</span>
        <span>{formatDateShort(media.publicationDate)}</span>
        {media.durationMinutes && (
          <>
            <span className="text-white/10">·</span>
            <span>{media.durationMinutes}m</span>
          </>
        )}
      </div>
      {firstSpeaker && (
        <div className="mt-2 text-[9px] text-white/20 font-mono">
          ft. {firstSpeaker.fullName}
        </div>
      )}
    </button>
  );
}

export default function IntelBottomPanel({
  isOpen,
  onToggle,
  activeTab,
  onSelectEvent,
  onSelectMedia,
}: IntelBottomPanelProps) {
  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={onToggle}
        className="absolute -top-6 left-1/2 -translate-x-1/2 z-10 w-16 h-6 bg-black/60 border border-white/10 border-b-0 rounded-t flex items-center justify-center text-white/30 hover:text-white/60 transition-colors"
      >
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="bg-black/60 backdrop-blur-md border-t border-white/5 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 256, opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          >
            <div className="h-64 p-4">
              {activeTab === 'map' ? (
                <div className="flex gap-6 h-full">
                  {/* Events Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
                      <h3 className="text-[9px] font-bold font-mono tracking-[0.2em] text-white/40">
                        UPCOMING EVENTS
                      </h3>
                      <span className="text-[9px] font-mono text-white/20">{intelEvents.length}</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 intel-bottom-scroll">
                      {intelEvents.map(event => (
                        <EventCard key={event.id} event={event} onClick={() => onSelectEvent?.(event)} />
                      ))}
                      {intelEvents.length === 0 && (
                        <div className="text-[10px] text-white/20 font-mono">No upcoming events</div>
                      )}
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-px bg-white/5 my-2" />

                  {/* Media Section */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <Newspaper className="w-3.5 h-3.5 text-emerald-400/60" />
                      <h3 className="text-[9px] font-bold font-mono tracking-[0.2em] text-white/40">
                        RECENT MEDIA
                      </h3>
                      <span className="text-[9px] font-mono text-white/20">{intelMedia.length}</span>
                    </div>
                    <div className="flex gap-3 overflow-x-auto pb-2 intel-bottom-scroll">
                      {intelMedia.map(media => (
                        <MediaCard key={media.id} media={media} onClick={() => onSelectMedia?.(media)} />
                      ))}
                      {intelMedia.length === 0 && (
                        <div className="text-[10px] text-white/20 font-mono">No recent media</div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* Stats summary for non-map tabs */
                <div className="flex items-center gap-8 h-full justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/80 font-mono">{intelEvents.length}</div>
                    <div className="text-[9px] font-mono text-white/30 tracking-wide mt-1">EVENTS TRACKED</div>
                  </div>
                  <div className="w-px h-12 bg-white/5" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/80 font-mono">{intelMedia.length}</div>
                    <div className="text-[9px] font-mono text-white/30 tracking-wide mt-1">MEDIA ITEMS</div>
                  </div>
                  <div className="w-px h-12 bg-white/5" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white/80 font-mono">{intelPeople.length}</div>
                    <div className="text-[9px] font-mono text-white/30 tracking-wide mt-1">PEOPLE TRACKED</div>
                  </div>
                  <div className="w-px h-12 bg-white/5" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-400/80 font-mono">
                      {intelEvents.filter(e => e.cantonRelevance === 'High').length}
                    </div>
                    <div className="text-[9px] font-mono text-white/30 tracking-wide mt-1">HIGH RELEVANCE</div>
                  </div>
                </div>
              )}
            </div>

            {/* Custom scrollbar styles */}
            <style jsx>{`
              .intel-bottom-scroll::-webkit-scrollbar { height: 3px; }
              .intel-bottom-scroll::-webkit-scrollbar-track { background: transparent; }
              .intel-bottom-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
