'use client';

import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  intelPeople,
  intelEvents,
  intelMedia,
  type IntelPerson,
  type IntelEvent,
  type IntelMedia,
} from '@/lib/canton-intel-data';
import { participants, type Participant } from '@/lib/canton-data';

// Dynamically import the force graph to handle SSR
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="text-white/40 text-xs font-mono">Loading network graph...</div>
    </div>
  )
});

interface GraphNode {
  id: string;
  name: string;
  type: 'Person' | 'Organization' | 'Event' | 'Media';
  val: number; // size
  color: string;
  // Original data reference
  data?: IntelPerson | IntelEvent | IntelMedia | Participant;
}

interface GraphLink {
  source: string;
  target: string;
  relationship: string;
  color?: string;
}

interface IntelRelationshipGraphProps {
  onNodeSelect?: (node: GraphNode) => void;
  height?: number;
}

// Node type colors
const NODE_COLORS = {
  Person: '#61dafb',     // cyan-400
  Organization: '#f87171', // rose-400 
  Event: '#fbbf24',      // amber-400
  Media: '#a78bfa'       // violet-400
};

// Filter button styles
const FILTER_BUTTON_STYLES = {
  Person: { active: 'bg-cyan-400 text-black', inactive: 'border-cyan-400 text-cyan-400' },
  Organization: { active: 'bg-rose-400 text-black', inactive: 'border-rose-400 text-rose-400' },
  Event: { active: 'bg-amber-400 text-black', inactive: 'border-amber-400 text-amber-400' },
  Media: { active: 'bg-violet-400 text-black', inactive: 'border-violet-400 text-violet-400' }
};

export default function IntelRelationshipGraph({ 
  onNodeSelect, 
  height = 500 
}: IntelRelationshipGraphProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const forceRef = useRef<any>(null);
  const [isClient, setIsClient] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Set<string>>(
    new Set(['Person', 'Organization', 'Event', 'Media'])
  );
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Build graph data from intel sources
  const { nodes, links } = useMemo(() => {
    const nodeMap = new Map<string, GraphNode>();
    const linkSet = new Set<string>();
    const linkArray: GraphLink[] = [];

    // Helper function to add a unique link
    const addLink = (source: string, target: string, relationship: string, sourceNode?: GraphNode) => {
      if (source === target) return;
      const linkId = `${source}-${target}-${relationship}`;
      if (linkSet.has(linkId)) return;
      
      linkSet.add(linkId);
      linkArray.push({
        source,
        target,
        relationship,
        color: sourceNode ? sourceNode.color : 'rgba(255,255,255,0.06)'
      });
    };

    // Add People nodes and their relationships
    for (const person of intelPeople) {
      const priorityWeights = { Critical: 8, High: 6, Medium: 4, Low: 2, 'N/A': 1 };
      const val = priorityWeights[person.priority as keyof typeof priorityWeights] || 2;
      
      const personNode: GraphNode = {
        id: person.id,
        name: person.fullName,
        type: 'Person',
        val,
        color: NODE_COLORS.Person,
        data: person
      };
      nodeMap.set(person.id, personNode);

      // Person → Organization relationships
      if (person.organizationId) {
        addLink(person.id, person.organizationId, 'works_for', personNode);
      }

      // Person → Event relationships
      for (const eventId of person.eventIds) {
        addLink(person.id, eventId, 'attends', personNode);
      }

      // Person → Media relationships
      for (const mediaId of person.mediaIds) {
        addLink(person.id, mediaId, 'featured_in', personNode);
      }
    }

    // Extract organization nodes from participants and create unique org nodes
    const organizationMap = new Map<string, { name: string; count: number; participant?: Participant }>();
    
    // First pass: collect all unique organization names and their counts
    for (const participant of participants) {
      const existing = organizationMap.get(participant.id);
      if (existing) {
        existing.count += 1;
      } else {
        organizationMap.set(participant.id, { 
          name: participant.name, 
          count: 1, 
          participant 
        });
      }
    }

    // Also collect org names from people data
    for (const person of intelPeople) {
      if (person.organizationId && !organizationMap.has(person.organizationId)) {
        organizationMap.set(person.organizationId, { 
          name: person.organization, 
          count: 1 
        });
      }
    }

    // Add Organization nodes
    for (const [orgId, orgData] of organizationMap.entries()) {
      const orgNode: GraphNode = {
        id: orgId,
        name: orgData.name,
        type: 'Organization',
        val: Math.min(orgData.count * 2 + 2, 10), // Scale by participant count, max 10
        color: NODE_COLORS.Organization,
        data: orgData.participant
      };
      nodeMap.set(orgId, orgNode);
    }

    // Add Event nodes and their relationships
    for (const event of intelEvents) {
      const attendeeCapWeight = event.attendeeCap ? Math.min(event.attendeeCap / 50, 8) : 3;
      const eventNode: GraphNode = {
        id: event.id,
        name: event.name,
        type: 'Event',
        val: attendeeCapWeight,
        color: NODE_COLORS.Event,
        data: event
      };
      nodeMap.set(event.id, eventNode);

      // Event → Organization relationships
      for (const orgId of event.cantonOrgIds) {
        addLink(event.id, orgId, 'involves_org', eventNode);
      }

      // Event → Person relationships (speakers)
      for (const speakerId of event.cantonSpeakerIds) {
        // Need to find person by name since speaker IDs are names
        const speaker = intelPeople.find(p => p.fullName === speakerId);
        if (speaker) {
          addLink(event.id, speaker.id, 'features_speaker', eventNode);
        }
      }
    }

    // Add Media nodes and their relationships
    for (const media of intelMedia) {
      const durationWeight = media.durationMinutes ? Math.min(media.durationMinutes / 30, 6) : 3;
      const mediaNode: GraphNode = {
        id: media.id,
        name: media.title,
        type: 'Media',
        val: durationWeight,
        color: NODE_COLORS.Media,
        data: media
      };
      nodeMap.set(media.id, mediaNode);

      // Media → Organization relationships
      for (const orgId of media.cantonOrgIds) {
        addLink(media.id, orgId, 'discusses_org', mediaNode);
      }

      // Media → Person relationships (speakers)
      for (const speakerId of media.cantonSpeakerIds) {
        const speaker = intelPeople.find(p => p.fullName === speakerId);
        if (speaker) {
          addLink(media.id, speaker.id, 'features_speaker', mediaNode);
        }
      }
    }

    // Filter nodes and links based on active filters
    const filteredNodes = Array.from(nodeMap.values()).filter(node => 
      activeFilters.has(node.type)
    );
    
    const activeNodeIds = new Set(filteredNodes.map(n => n.id));
    const filteredLinks = linkArray.filter(link => 
      activeNodeIds.has(String(link.source)) && activeNodeIds.has(String(link.target))
    );

    return { 
      nodes: filteredNodes, 
      links: filteredLinks 
    };
  }, [activeFilters]);

  // Toggle filter
  const toggleFilter = useCallback((type: string) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  }, []);

  // Node click handler
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeClick = useCallback((rawNode: any) => {
    const node = rawNode as GraphNode;
    if (onNodeSelect) {
      onNodeSelect(node);
    }
  }, [onNodeSelect]);

  // Node hover handlers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleNodeHover = useCallback((rawNode: any) => {
    const node = rawNode as GraphNode | null;
    setHoveredNodeId(node?.id || null);
    
    if (forceRef.current) {
      // Highlight connected nodes/edges, dim unconnected
      const connectedNodeIds = new Set<string>();
      if (node) {
        connectedNodeIds.add(node.id);
        
        // Find all connected nodes
        links.forEach(link => {
          if (String(link.source) === node.id) {
            connectedNodeIds.add(String(link.target));
          } else if (String(link.target) === node.id) {
            connectedNodeIds.add(String(link.source));
          }
        });
      }
      
      // Reheat simulation on hover change
      forceRef.current.d3ReheatSimulation();
    }
  }, [links]);

  // Custom node rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nodeCanvasObject = useCallback((rawNode: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
    const node = rawNode as GraphNode & { x?: number; y?: number };
    const { x = 0, y = 0, type: _type, val, color } = node;
    const size = Math.max(val * 2, 6);
    
    // Determine opacity based on hover state
    let opacity = 1.0;
    if (hoveredNodeId && hoveredNodeId !== node.id) {
      const isConnected = links.some(link => 
        (String(link.source) === hoveredNodeId && String(link.target) === node.id) ||
        (String(link.target) === hoveredNodeId && String(link.source) === node.id)
      );
      opacity = isConnected ? 0.8 : 0.2;
    }

    // Draw node with glow effect
    ctx.save();
    ctx.globalAlpha = opacity;
    
    // Outer glow
    const glowSize = size + 4;
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '00');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, glowSize, 0, 2 * Math.PI);
    ctx.fill();

    // Main node
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, 2 * Math.PI);
    ctx.fill();

    // Label
    if (globalScale > 1.5) {
      ctx.fillStyle = 'white';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      const labelY = y + size + 12;
      
      // Truncate long names
      let displayName = node.name;
      if (displayName.length > 20) {
        displayName = displayName.substring(0, 17) + '...';
      }
      
      ctx.fillText(displayName, x, labelY);
    }
    
    ctx.restore();
  }, [hoveredNodeId, links]);

  // Custom link rendering
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const linkCanvasObject = useCallback((link: any, ctx: CanvasRenderingContext2D) => {
    const source = link.source;
    const target = link.target;
    if (!source?.x || !target?.x) return;

    const sx = source.x as number;
    const sy = (source.y ?? 0) as number;
    const tx = target.x as number;
    const ty = (target.y ?? 0) as number;

    // Determine opacity based on hover state
    let opacity = 0.06;
    if (hoveredNodeId) {
      const sourceId = typeof source === 'object' ? source.id : String(source);
      const targetId = typeof target === 'object' ? target.id : String(target);
      const isConnected = sourceId === hoveredNodeId || targetId === hoveredNodeId;
      opacity = isConnected ? 0.3 : 0.02;
    }

    // Draw link
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(tx, ty);
    ctx.lineTo(target.x, target.y);
    ctx.stroke();
    ctx.restore();
  }, [hoveredNodeId]);

  if (!isClient) {
    return (
      <div className="w-full bg-black" style={{ height }}>
        <div className="flex items-center justify-center h-full">
          <div className="text-white/40 text-xs font-mono">Loading network graph...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-black relative" style={{ height }}>
      {/* Filter Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        {(['Person', 'Organization', 'Event', 'Media'] as const).map(type => {
          const isActive = activeFilters.has(type);
          const styles = FILTER_BUTTON_STYLES[type];
          return (
            <button
              key={type}
              onClick={() => toggleFilter(type)}
              className={`px-2 py-1 text-[10px] font-mono uppercase tracking-wider rounded transition-colors border ${
                isActive ? styles.active : `border ${styles.inactive} bg-transparent`
              }`}
            >
              {type}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="text-[9px] text-white/40 space-y-1">
          <div className="text-white/60 font-mono uppercase tracking-wider mb-2">Node Types</div>
          {(['Person', 'Organization', 'Event', 'Media'] as const).map(type => (
            <div key={type} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: NODE_COLORS[type] }}
              />
              <span>{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Force Graph - react-force-graph-2d has loose generics that don't match our custom node/link types */}
      {/* eslint-disable @typescript-eslint/no-explicit-any */}
      <ForceGraph2D
        ref={forceRef}
        graphData={{ nodes, links }}
        width={undefined}
        height={height}
        backgroundColor="rgba(0,0,0,0)"
        
        // Node properties
        nodeVal={(node: any) => node.val}
        nodeColor={(node: any) => node.color}
        nodeCanvasObject={nodeCanvasObject as any}
        nodePointerAreaPaint={() => {}}
        
        // Link properties
        linkDirectionalParticles={2}
        linkDirectionalParticleSpeed={0.005}
        linkCanvasObject={linkCanvasObject as any}
        linkColor={() => 'rgba(255,255,255,0.06)'}
        linkDirectionalParticleColor={(link: any) => link.color || '#61dafb'}
        linkPointerAreaPaint={() => {}}
        
        // Force layout
        d3AlphaDecay={0.02}
        cooldownTime={3000}
        d3VelocityDecay={0.3}
        
        // Interaction
        onNodeClick={handleNodeClick as any}
        onNodeHover={handleNodeHover as any}
        onLinkHover={() => {}}
        onBackgroundClick={() => setHoveredNodeId(null)}
        
        // Enable zoom/pan
        enableZoomInteraction={true}
        enablePanInteraction={true}
        enableNodeDrag={true}
      />
      {/* eslint-enable @typescript-eslint/no-explicit-any */}
    </div>
  );
}