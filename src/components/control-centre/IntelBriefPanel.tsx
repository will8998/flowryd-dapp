'use client';

import React, { useMemo } from 'react';
import { Shield, Activity, TrendingUp, AlertTriangle, Globe, Users } from 'lucide-react';
import { participants } from '@/lib/canton-data';
import {
  intelEvents,
  intelMedia,
  intelPeople,
  intelAnnouncements,
  cipRegistry,
} from '@/lib/canton-intel-data';

interface IntelBriefPanelProps {
  className?: string;
}

function StatCard({ label, value, color, icon: Icon }: {
  label: string;
  value: string | number;
  color: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-white/[0.02] border border-white/5 rounded-lg">
      <div className={`w-7 h-7 rounded flex items-center justify-center ${color}`}>
        <Icon className="w-3.5 h-3.5" />
      </div>
      <div>
        <div className="text-sm font-bold font-mono text-white/90">{value}</div>
        <div className="text-[8px] font-mono text-white/30 tracking-wider">{label}</div>
      </div>
    </div>
  );
}

export default function IntelBriefPanel({ className }: IntelBriefPanelProps) {
  const stats = useMemo(() => {
    const validators = participants.filter(p => p.validatorNodes && p.validatorNodes > 0);
    const superValidators = participants.filter(p => p.superValidator);
    const highRelevance = intelEvents.filter(e => e.cantonRelevance === 'High');
    const approvedCIPs = cipRegistry.filter(c => c.status === 'Approved');

    // Recent activity: announcements from last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentAnnouncements = intelAnnouncements.filter(a => new Date(a.date) >= thirtyDaysAgo);

    return {
      participants: participants.length,
      validators: validators.length,
      superValidators: superValidators.length,
      events: intelEvents.length,
      highRelevanceEvents: highRelevance.length,
      media: intelMedia.length,
      people: intelPeople.length,
      announcements: intelAnnouncements.length,
      recentAnnouncements: recentAnnouncements.length,
      cips: cipRegistry.length,
      approvedCIPs: approvedCIPs.length,
    };
  }, []);

  return (
    <div className={`bg-black/40 backdrop-blur-sm flex flex-col h-full ${className ?? ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="text-[9px] font-bold font-mono tracking-[0.2em] text-white/40">
            INTEL BRIEF
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[8px] font-mono font-bold text-emerald-400 tracking-wider">LIVE</span>
          </div>
        </div>
      </div>

      {/* Network Status */}
      <div className="p-4 border-b border-white/5">
        <div className="text-[9px] font-mono text-white/30 tracking-wider mb-3">NETWORK STATUS</div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-emerald-400">OPERATIONAL</span>
        </div>
        <div className="text-[10px] text-white/40 leading-relaxed">
          Canton Network active with {stats.participants} participants across {stats.validators} validator nodes. 
          {stats.superValidators} super validators maintaining consensus.
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="p-4 border-b border-white/5 space-y-2">
        <div className="text-[9px] font-mono text-white/30 tracking-wider mb-3">KEY METRICS</div>
        <StatCard label="PARTICIPANTS" value={stats.participants} color="bg-cyan-500/10 text-cyan-400" icon={Globe} />
        <StatCard label="VALIDATORS" value={stats.validators} color="bg-emerald-500/10 text-emerald-400" icon={Shield} />
        <StatCard label="EVENTS TRACKED" value={stats.events} color="bg-amber-500/10 text-amber-400" icon={Activity} />
        <StatCard label="HIGH RELEVANCE" value={stats.highRelevanceEvents} color="bg-red-500/10 text-red-400" icon={AlertTriangle} />
        <StatCard label="PEOPLE TRACKED" value={stats.people} color="bg-purple-500/10 text-purple-400" icon={Users} />
        <StatCard label="MEDIA ITEMS" value={stats.media} color="bg-blue-500/10 text-blue-400" icon={TrendingUp} />
      </div>

      {/* Governance */}
      <div className="p-4 border-b border-white/5">
        <div className="text-[9px] font-mono text-white/30 tracking-wider mb-3">GOVERNANCE</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-white/40">CIPs Total</span>
            <span className="text-white/70">{stats.cips}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-white/40">CIPs Approved</span>
            <span className="text-emerald-400/70">{stats.approvedCIPs}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-white/40">Announcements</span>
            <span className="text-white/70">{stats.announcements}</span>
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-white/40">Recent (30d)</span>
            <span className="text-amber-400/70">{stats.recentAnnouncements}</span>
          </div>
        </div>
      </div>

      {/* Strategic Posture */}
      <div className="p-4 flex-1">
        <div className="text-[9px] font-mono text-white/30 tracking-wider mb-3">STRATEGIC POSTURE</div>
        <div className="space-y-2">
          <div className="p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-white/50">Network Growth</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">EXPANDING</span>
            </div>
            <div className="text-[9px] text-white/30">
              {stats.superValidators} super validators active
            </div>
          </div>
          <div className="p-2.5 bg-amber-500/5 border border-amber-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-white/50">Event Activity</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">ACTIVE</span>
            </div>
            <div className="text-[9px] text-white/30">
              {stats.highRelevanceEvents} high-relevance events
            </div>
          </div>
          <div className="p-2.5 bg-cyan-500/5 border border-cyan-500/10 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-white/50">Media Coverage</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 bg-cyan-500/20 text-cyan-400 rounded">MONITORED</span>
            </div>
            <div className="text-[9px] text-white/30">
              {stats.media} items across {new Set(intelMedia.map(m => m.publisher)).size} publishers
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
