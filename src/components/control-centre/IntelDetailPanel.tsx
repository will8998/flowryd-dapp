'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Calendar, MapPin, Users, ExternalLink, Clock, Building2,
  User, Newspaper, Mic, Video, FileText, Globe, Tag, MessageSquareQuote,
  Lightbulb, ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import IntelNewsFeed from './IntelNewsFeed';
import {
  type IntelEvent,
  type IntelPerson,
  type IntelMedia,
  getPersonById,
  getOrgById,
  getPeopleForEvent,
  getOrgsForEvent,
  getEventsForPerson,
  getMediaForPerson,
} from '@/lib/canton-intel-data';

interface IntelDetailPanelProps {
  selectedEvent?: IntelEvent | null;
  selectedPerson?: IntelPerson | null;
  selectedMedia?: IntelMedia | null;
  onClose: () => void;
  onSelectPerson?: (person: IntelPerson) => void;
  onSelectEvent?: (event: IntelEvent) => void;
  onSelectMedia?: (media: IntelMedia) => void;
}

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleDateString('en-US', { month: 'short' });
  const startDay = s.getDate();
  const endDay = e.getDate();
  const year = s.getFullYear();
  if (s.getMonth() === e.getMonth()) {
    return `${month} ${startDay}-${endDay}, ${year}`;
  }
  const endMonth = e.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${startDay} - ${endMonth} ${endDay}, ${year}`;
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ── Section helper ───────────────────────────────── */
function Section({ icon: Icon, label, children }: { icon: React.ElementType; label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className="w-3 h-3 text-white/30" />
        <span className="text-[9px] font-bold font-mono tracking-[0.15em] text-white/30">{label}</span>
      </div>
      {children}
    </div>
  );
}

/* ── Event Detail ─────────────────────────────────── */
function EventDetail({ event, onSelectPerson }: { event: IntelEvent; onSelectPerson?: (p: IntelPerson) => void }) {
  const speakers = getPeopleForEvent(event.id);
  const orgs = getOrgsForEvent(event.id);

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <div className="flex items-center gap-1.5 mb-1">
          <Calendar className="w-3.5 h-3.5 text-amber-400/60" />
          <Badge variant={event.cantonRelevance === 'High' ? 'warning' : 'info'}>{event.cantonRelevance} Relevance</Badge>
        </div>
        <h3 className="text-sm font-bold text-white/90 mb-1">{event.name}</h3>
        <Badge variant="default">{event.type}</Badge>
      </div>

      <Section icon={Clock} label="DATES">
        <p className="text-xs text-white/60 font-mono">{formatDateRange(event.startDate, event.endDate)}</p>
      </Section>

      <Section icon={MapPin} label="LOCATION">
        <p className="text-xs text-white/60">{event.location}</p>
        {event.venue && <p className="text-[10px] text-white/30">{event.venue}</p>}
      </Section>

      {event.attendeeCap && (
        <Section icon={Users} label="CAPACITY">
          <p className="text-xs text-white/60 font-mono">{event.attendeeCap} attendees</p>
          {event.applicationRequired && <p className="text-[10px] text-amber-400/50">Invite only</p>}
        </Section>
      )}

      <Section icon={Tag} label="TOPICS">
        <div className="flex flex-wrap gap-1">
          {event.topicsCovered.map(topic => (
            <span key={topic} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
              {topic}
            </span>
          ))}
        </div>
      </Section>

      {speakers.length > 0 && (
        <Section icon={User} label="CANTON SPEAKERS">
          <div className="space-y-1.5">
            {speakers.map(person => {
              const org = getOrgById(person.organizationId);
              return (
                <button
                  key={person.id}
                  onClick={() => onSelectPerson?.(person)}
                  className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-2.5 h-2.5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-white/70 group-hover:text-white font-medium truncate">{person.fullName}</div>
                    <div className="text-[9px] text-white/30 font-mono truncate">{org?.name ?? 'Unknown'}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/30" />
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {orgs.length > 0 && (
        <Section icon={Building2} label="ORGANIZATIONS PRESENT">
          <div className="flex flex-wrap gap-1">
            {orgs.map(org => (
              <span key={org.id} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
                {org.name}
              </span>
            ))}
          </div>
        </Section>
      )}

      {event.notes && (
        <Section icon={Lightbulb} label="NOTES">
          <p className="text-[10px] text-white/40 leading-relaxed">{event.notes}</p>
        </Section>
      )}

      {event.followUpActions && (
        <Section icon={ChevronRight} label="FOLLOW-UP">
          <p className="text-[10px] text-amber-400/50 leading-relaxed">{event.followUpActions}</p>
        </Section>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        <Badge variant={event.flowrydAttended ? 'success' : 'default'}>
          {event.flowrydAttended ? 'Attended' : 'Not Attended'}
        </Badge>
        {event.flowrydSpeaking && <Badge variant="warning">Speaking</Badge>}
      </div>

      {event.sourceUrl && (
        <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors mt-2">
          <ExternalLink className="w-3 h-3" />
          <span className="font-mono">Source</span>
        </a>
      )}
    </div>
  );
}

/* ── Person Detail ────────────────────────────────── */
function PersonDetail({ person, onSelectEvent, onSelectMedia }: { person: IntelPerson; onSelectEvent?: (e: IntelEvent) => void; onSelectMedia?: (m: IntelMedia) => void }) {
  const org = getOrgById(person.organizationId);
  const events = getEventsForPerson(person.id);
  const media = getMediaForPerson(person.id);

  return (
    <div className="space-y-1">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <User className="w-4 h-4 text-white/40" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white/90">{person.fullName}</h3>
            <p className="text-[10px] text-white/40 font-mono">{person.currentRole}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={person.priority === 'High' ? 'warning' : person.priority === 'Medium' ? 'info' : 'default'}>
            {person.priority} Priority
          </Badge>
          <Badge variant={person.relationshipToFlowryd === 'Partner' ? 'success' : person.relationshipToFlowryd === 'Connected' ? 'info' : person.relationshipToFlowryd === 'Warm' ? 'warning' : 'default'}>
            {person.relationshipToFlowryd}
          </Badge>
        </div>
      </div>

      {org && (
        <Section icon={Building2} label="ORGANIZATION">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/60">{org.name}</span>
            <Badge variant="default">{org.cantonRole}</Badge>
          </div>
          {org.criticality && (
            <p className="text-[9px] text-white/30 font-mono mt-0.5">{org.criticality} participant</p>
          )}
        </Section>
      )}

      <Section icon={Tag} label="CANTON ROLES">
        <div className="flex flex-wrap gap-1">
          {person.cantonRoles.map(role => (
            <span key={role} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
              {role}
            </span>
          ))}
        </div>
      </Section>

      {events.length > 0 && (
        <Section icon={Calendar} label="EVENTS">
          <div className="space-y-1">
            {events.map(event => (
              <button
                key={event.id}
                onClick={() => onSelectEvent?.(event)}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors text-left group"
              >
                <Calendar className="w-3 h-3 text-amber-400/40 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-white/70 group-hover:text-white truncate">{event.name}</div>
                  <div className="text-[9px] text-white/30 font-mono">{formatDateRange(event.startDate, event.endDate)}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/30" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {media.length > 0 && (
        <Section icon={Newspaper} label="MEDIA APPEARANCES">
          <div className="space-y-1">
            {media.map(m => (
              <button
                key={m.id}
                onClick={() => onSelectMedia?.(m)}
                className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors text-left group"
              >
                {m.mediaType === 'Podcast' ? <Mic className="w-3 h-3 text-purple-400/40 shrink-0" /> :
                 m.mediaType === 'Webinar' ? <Video className="w-3 h-3 text-cyan-400/40 shrink-0" /> :
                 <FileText className="w-3 h-3 text-emerald-400/40 shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-white/70 group-hover:text-white truncate">{m.title}</div>
                  <div className="text-[9px] text-white/30 font-mono">{m.publisher} · {formatDate(m.publicationDate)}</div>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/30" />
              </button>
            ))}
          </div>
        </Section>
      )}

      {person.notes && (
        <Section icon={Lightbulb} label="INTEL NOTES">
          <p className="text-[10px] text-white/40 leading-relaxed">{person.notes}</p>
        </Section>
      )}

      {(person.linkedinUrl || person.twitterHandle) && (
        <Section icon={Globe} label="SOCIAL">
          <div className="flex gap-2">
            {person.linkedinUrl && (
              <a href={person.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[9px] text-white/30 hover:text-white/60 font-mono transition-colors">LinkedIn</a>
            )}
            {person.twitterHandle && (
              <span className="text-[9px] text-white/30 font-mono">{person.twitterHandle}</span>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}

/* ── Media Detail ─────────────────────────────────── */
function MediaDetail({ media, onSelectPerson }: { media: IntelMedia; onSelectPerson?: (p: IntelPerson) => void }) {
  return (
    <div className="space-y-1">
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          {media.mediaType === 'Podcast' ? <Mic className="w-4 h-4 text-purple-400/60" /> :
           media.mediaType === 'Webinar' ? <Video className="w-4 h-4 text-cyan-400/60" /> :
           <FileText className="w-4 h-4 text-emerald-400/60" />}
          <Badge variant="default">{media.mediaType}</Badge>
          <Badge variant={media.sentiment === 'Bullish' ? 'success' : media.sentiment === 'Bearish' ? 'danger' : 'default'}>
            {media.sentiment}
          </Badge>
        </div>
        <h3 className="text-sm font-bold text-white/90 mb-1">{media.title}</h3>
        <div className="flex items-center gap-2 text-[10px] text-white/40 font-mono">
          <span>{media.publisher}</span>
          {media.seriesName && (
            <>
              <span className="text-white/10">·</span>
              <span>{media.seriesName}</span>
            </>
          )}
        </div>
      </div>

      <Section icon={Clock} label="PUBLISHED">
        <div className="flex items-center gap-3 text-xs text-white/60 font-mono">
          <span>{formatDate(media.publicationDate)}</span>
          {media.durationMinutes && <span>{media.durationMinutes} min</span>}
        </div>
      </Section>

      <Section icon={Tag} label="TOPICS">
        <div className="flex flex-wrap gap-1">
          {media.topicsCovered.map(topic => (
            <span key={topic} className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
              {topic}
            </span>
          ))}
        </div>
      </Section>

      {media.cantonSpeakerIds.length > 0 && (
        <Section icon={User} label="SPEAKERS">
          <div className="space-y-1.5">
            {media.cantonSpeakerIds.map(id => {
              const person = getPersonById(id);
              if (!person) return null;
              const org = getOrgById(person.organizationId);
              return (
                <button
                  key={person.id}
                  onClick={() => onSelectPerson?.(person)}
                  className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-white/5 transition-colors text-left group"
                >
                  <div className="w-5 h-5 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <User className="w-2.5 h-2.5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] text-white/70 group-hover:text-white truncate">{person.fullName}</div>
                    <div className="text-[9px] text-white/30 font-mono truncate">{org?.name ?? 'Unknown'}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/30" />
                </button>
              );
            })}
          </div>
        </Section>
      )}

      {media.keyQuotes && (
        <Section icon={MessageSquareQuote} label="KEY QUOTES">
          <blockquote className="text-[10px] text-white/50 leading-relaxed italic border-l-2 border-white/10 pl-2">
            {media.keyQuotes}
          </blockquote>
        </Section>
      )}

      {media.strategicInsights && (
        <Section icon={Lightbulb} label="STRATEGIC INSIGHTS">
          <p className="text-[10px] text-amber-400/50 leading-relaxed">{media.strategicInsights}</p>
        </Section>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        {media.cantonMentions && <Badge variant="info">Canton Mentioned</Badge>}
        {media.transcriptAvailable && <Badge variant="default">Transcript</Badge>}
      </div>

      {media.sourceUrl && (
        <a href={media.sourceUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white/60 transition-colors mt-2">
          <ExternalLink className="w-3 h-3" />
          <span className="font-mono">View Source</span>
        </a>
      )}
    </div>
  );
}

/* ── Main Panel ───────────────────────────────────── */
export default function IntelDetailPanel({
  selectedEvent,
  selectedPerson,
  selectedMedia,
  onClose,
  onSelectPerson,
  onSelectEvent,
  onSelectMedia,
}: IntelDetailPanelProps) {
  const hasSelection = selectedEvent || selectedPerson || selectedMedia;

  return (
    <div className="w-full h-full flex flex-col">
      <AnimatePresence mode="wait">
        {hasSelection ? (
          <motion.div
            key="detail"
            className="flex-1 flex flex-col min-h-0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-center justify-between p-3 border-b border-white/5">
              <h2 className="text-[9px] font-bold font-mono tracking-[0.2em] text-white/40">
                {selectedEvent ? 'EVENT DETAIL' : selectedPerson ? 'PERSON DETAIL' : 'MEDIA DETAIL'}
              </h2>
              <button
                onClick={onClose}
                className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/10 transition-colors"
              >
                <X className="w-3 h-3 text-white/40 hover:text-white" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 intel-detail-scroll">
              {selectedEvent && <EventDetail event={selectedEvent} onSelectPerson={onSelectPerson} />}
              {selectedPerson && <PersonDetail person={selectedPerson} onSelectEvent={onSelectEvent} onSelectMedia={onSelectMedia} />}
              {selectedMedia && <MediaDetail media={selectedMedia} onSelectPerson={onSelectPerson} />}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="news"
            className="flex-1 min-h-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.15 }}
          >
            <IntelNewsFeed />
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .intel-detail-scroll::-webkit-scrollbar { width: 3px; }
        .intel-detail-scroll::-webkit-scrollbar-track { background: transparent; }
        .intel-detail-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>
    </div>
  );
}
