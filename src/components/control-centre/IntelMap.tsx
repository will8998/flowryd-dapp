'use client';
import React, { useState, useMemo, useCallback } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { participants, type Participant } from '@/lib/canton-data';
import { type IntelEvent } from '@/lib/canton-intel-data';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const INITIAL_VIEW = {
  longitude: 0,
  latitude: 30,
  zoom: 2,
  pitch: 0,
  bearing: 0,
};

interface IntelMapProps {
  onSelectParticipant?: (participant: Participant) => void;
  selectedParticipantId?: string;
  events?: IntelEvent[];
  onSelectEvent?: (event: IntelEvent) => void;
}

function formatEventDates(startDate: string, endDate: string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startMonth = start.toLocaleString('en-US', { month: 'short' });
  const endMonth = end.toLocaleString('en-US', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = end.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}–${endDay}, ${year}`;
  }
  return `${startMonth} ${startDay} – ${endMonth} ${endDay}, ${year}`;
}

export default function IntelMap({
  onSelectParticipant,
  selectedParticipantId: _selectedParticipantId,
  events = [],
  onSelectEvent,
}: IntelMapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedPopupId, setSelectedPopupId] = useState<string | null>(null);
  const [selectedEventPopupId, setSelectedEventPopupId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Filter participants with valid coordinates
  const validParticipants = useMemo(() => 
    participants.filter(p => p.lat != null && p.lng != null), 
    []
  );

  // Filter events with valid coordinates
  const validEvents = useMemo(() =>
    events.filter(e => e.lat != null && e.lng != null),
    [events]
  );

  const handleMarkerClick = useCallback((participant: Participant) => {
    setSelectedPopupId(participant.id);
    setSelectedEventPopupId(null);
    onSelectParticipant?.(participant);
  }, [onSelectParticipant]);

  const handleMarkerMouseEnter = useCallback((participant: Participant, event: React.MouseEvent) => {
    setHoveredId(participant.id);
    setMousePos({ x: event.clientX, y: event.clientY });
  }, []);

  const handleMarkerMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  const handleMapClick = useCallback(() => {
    setSelectedPopupId(null);
    setSelectedEventPopupId(null);
  }, []);

  const handleEventMarkerClick = useCallback((event: IntelEvent) => {
    setSelectedEventPopupId(event.id);
    setSelectedPopupId(null);
    onSelectEvent?.(event);
  }, [onSelectEvent]);

  const selectedEvent = useMemo(() =>
    validEvents.find(e => e.id === selectedEventPopupId) ?? null,
    [validEvents, selectedEventPopupId]
  );

  return (
    <>
      <style>{`
        .maplibregl-popup-content {
          background: rgba(0, 0, 0, 0.95) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 8px !important;
          padding: 0 !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.5) !important;
          color: white !important;
        }
        .maplibregl-popup-tip {
          border-top-color: rgba(0, 0, 0, 0.95) !important;
        }
        .maplibregl-popup-close-button {
          color: rgba(255, 255, 255, 0.4) !important;
          font-size: 16px !important;
          padding: 4px 8px !important;
          background: transparent !important;
          border: none !important;
        }
        .maplibregl-popup-close-button:hover {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .maplibregl-ctrl-group {
          background: rgba(0, 0, 0, 0.8) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          border-radius: 4px !important;
        }
        .maplibregl-ctrl-group button {
          background: transparent !important;
          color: rgba(255, 255, 255, 0.6) !important;
          border: none !important;
        }
        .maplibregl-ctrl-group button:hover {
          background: rgba(255, 255, 255, 0.05) !important;
          color: rgba(255, 255, 255, 0.9) !important;
        }
        @keyframes marker-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.4); opacity: 0.3; }
        }
        .marker-pulse {
          animation: marker-pulse 2s infinite;
        }
      `}</style>
      
      <div style={{ width: '100%', height: '100%' }} className="relative">
        <Map
          {...INITIAL_VIEW}
          style={{ width: '100%', height: '100%' }}
          mapStyle={MAP_STYLE}
          onClick={handleMapClick}
          interactiveLayerIds={[]}
          cursor="default"
        >
          <NavigationControl position="top-right" showCompass={false} />
          
          {/* Markers */}
          {validParticipants.map((participant) => {
            const isCritical = participant.criticality === 'CRITICAL';
            const isRequired = participant.criticality === 'REQUIRED';
            const isOptional = participant.criticality === 'OPTIONAL';
            
            return (
              <Marker
                key={participant.id}
                longitude={participant.lng!}
                latitude={participant.lat!}
                anchor="center"
              >
                <div className="relative">
                  {/* Pulse ring for critical markers */}
                  {isCritical && (
                    <div 
                      className="absolute inset-0 -m-1 bg-white/20 rounded-full marker-pulse"
                      style={{ width: '20px', height: '20px', top: '-3px', left: '-3px' }}
                    />
                  )}
                  
                  <div 
                    className={`
                      relative rounded-full cursor-pointer transition-all duration-200 
                      ${isCritical ? 'w-3.5 h-3.5 bg-white shadow-[0_0_12px_rgba(255,255,255,0.6)]' : ''}
                      ${isRequired ? 'w-2.5 h-2.5 bg-white/60 shadow-[0_0_8px_rgba(255,255,255,0.3)]' : ''}
                      ${isOptional ? 'w-2 h-2 bg-white/30' : ''}
                      ${participant.superValidator ? 'ring-2 ring-emerald-400/50' : ''}
                      ${hoveredId === participant.id ? 'scale-125' : ''}
                    `}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkerClick(participant);
                    }}
                    onMouseEnter={(e) => handleMarkerMouseEnter(participant, e)}
                    onMouseLeave={handleMarkerMouseLeave}
                  />
                </div>
              </Marker>
            );
          })}

          {/* Event Markers */}
          {validEvents.map(event => (
            <Marker key={event.id} longitude={event.lng!} latitude={event.lat!}>
              <div
                className="relative cursor-pointer group"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEventMarkerClick(event);
                }}
              >
                {/* Outer pulse ring */}
                <div className="absolute inset-0 w-5 h-5 -m-0.5 rounded bg-amber-400/20 animate-ping" />
                {/* Main marker — amber diamond shape */}
                <div className="w-4 h-4 bg-amber-400 rotate-45 shadow-[0_0_12px_rgba(251,191,36,0.6)] group-hover:scale-125 transition-transform" />
              </div>
            </Marker>
          ))}

          {/* Participant Popup */}
          {selectedPopupId && validParticipants.find(p => p.id === selectedPopupId) && (
            <Popup
              longitude={validParticipants.find(p => p.id === selectedPopupId)!.lng!}
              latitude={validParticipants.find(p => p.id === selectedPopupId)!.lat!}
              anchor="bottom"
              onClose={() => setSelectedPopupId(null)}
              closeButton={true}
              closeOnClick={false}
            >
              {(() => {
                const participant = validParticipants.find(p => p.id === selectedPopupId)!;
                return (
                  <div className="p-4 max-w-xs">
                    <div className="font-bold text-sm mb-1">{participant.name}</div>
                    <div className="text-xs text-white/50 font-mono mb-3">{participant.cantonRole}</div>
                    
                    {participant.description && (
                      <div className="text-xs text-white/70 mb-3">{participant.description}</div>
                    )}
                    
                    {participant.capabilities && Object.keys(participant.capabilities).length > 0 && (
                      <div className="mb-3">
                        <div className="text-[10px] text-white/40 font-mono mb-1">CAPABILITIES</div>
                        <div className="flex flex-wrap gap-1">
                          {Object.keys(participant.capabilities).map((capability, index) => (
                            <span 
                              key={index}
                              className="text-[8px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono"
                            >
                              {capability}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {participant.validatorNodes && participant.validatorNodes > 0 && (
                      <div className="text-[10px] text-white/60 font-mono">
                        VALIDATOR NODES: {participant.validatorNodes}
                      </div>
                    )}
                    
                    {participant.superValidator && (
                      <div className="text-[10px] text-emerald-400 font-mono mt-1">
                        SUPER VALIDATOR
                      </div>
                    )}
                  </div>
                );
              })()}
            </Popup>
          )}

          {/* Event Popup */}
          {selectedEvent && (
            <Popup
              longitude={selectedEvent.lng!}
              latitude={selectedEvent.lat!}
              anchor="bottom"
              onClose={() => setSelectedEventPopupId(null)}
              closeButton={true}
              closeOnClick={false}
            >
              <div className="p-4 max-w-xs">
                {/* Name */}
                <div className="font-bold text-sm mb-1">{selectedEvent.name}</div>

                {/* Type badge */}
                <span className="inline-block text-[9px] font-mono px-1.5 py-0.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 rounded mb-2">
                  {selectedEvent.type.toUpperCase()}
                </span>

                {/* Location */}
                <div className="text-[11px] font-mono text-white/60 mb-1">
                  {selectedEvent.venue ? `${selectedEvent.venue}, ` : ''}{selectedEvent.location}
                </div>

                {/* Dates */}
                <div className="text-[11px] font-mono text-white/50 mb-3">
                  {formatEventDates(selectedEvent.startDate, selectedEvent.endDate)}
                </div>

                {/* Canton Relevance badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[9px] font-mono text-white/40">CANTON RELEVANCE</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    selectedEvent.cantonRelevance === 'High'
                      ? 'bg-amber-400/15 border-amber-400/30 text-amber-300'
                      : selectedEvent.cantonRelevance === 'Medium'
                      ? 'bg-white/10 border-white/20 text-white/60'
                      : 'bg-white/5 border-white/10 text-white/40'
                  }`}>
                    {selectedEvent.cantonRelevance.toUpperCase()}
                  </span>
                </div>

                {/* Attendee cap */}
                {selectedEvent.attendeeCap != null && (
                  <div className="text-[10px] font-mono text-white/50 mb-2">
                    ATTENDEES: {selectedEvent.attendeeCap}
                  </div>
                )}

                {/* Notes */}
                {selectedEvent.notes && (
                  <div className="text-[10px] text-white/60 border-t border-white/10 pt-2 mt-2">
                    {selectedEvent.notes.length > 100
                      ? `${selectedEvent.notes.slice(0, 100)}…`
                      : selectedEvent.notes}
                  </div>
                )}
              </div>
            </Popup>
          )}
        </Map>

        {/* Hover Tooltip */}
        {hoveredId && validParticipants.find(p => p.id === hoveredId) && (
          <div 
            className="fixed z-50 pointer-events-none bg-black/90 border border-white/10 backdrop-blur-sm rounded px-2 py-1 -translate-x-1/2 -translate-y-full"
            style={{ 
              left: mousePos.x, 
              top: mousePos.y - 8,
              transform: 'translate(-50%, -100%)'
            }}
          >
            {(() => {
              const participant = validParticipants.find(p => p.id === hoveredId)!;
              return (
                <>
                  <div className="text-[10px] font-bold text-white">{participant.name}</div>
                  <div className="text-[8px] text-white/50 font-mono">{participant.cantonRole}</div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </>
  );
}
