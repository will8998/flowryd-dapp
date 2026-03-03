"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Clock, ChevronRight } from 'lucide-react';
import { useDeals } from '@/hooks/use-deals';
import { authFetch } from '@/lib/auth-fetch';

const STATUSES = ['draft', 'open', 'negotiating', 'locked', 'committed'] as const;

const STATUS_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  draft:       { color: 'text-white/50',    bg: 'bg-white/10',        border: 'border-white/10',      label: 'Draft' },
  open:        { color: 'text-blue-400',    bg: 'bg-blue-500/10',     border: 'border-blue-500/20',   label: 'Open' },
  negotiating: { color: 'text-yellow-400',  bg: 'bg-yellow-500/10',   border: 'border-yellow-500/20', label: 'Negotiating' },
  locked:      { color: 'text-orange-400',  bg: 'bg-orange-500/10',   border: 'border-orange-500/20', label: 'Locked' },
  committed:   { color: 'text-emerald-400', bg: 'bg-emerald-500/10',  border: 'border-emerald-500/20', label: 'Committed' },
};

const DOT_COLORS: Record<string, string> = {
  draft: 'bg-white/40',
  open: 'bg-blue-500/60',
  negotiating: 'bg-yellow-500/60',
  locked: 'bg-orange-500/60',
  committed: 'bg-emerald-500/60',
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export const ActivateEngine: React.FC = () => {
  const { deals, isLoading, refetch } = useDeals();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUSES.forEach(s => { counts[s] = 0; });
    deals.forEach(d => {
      const s = (d.status || 'draft').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [deals]);

  const filteredDeals = useMemo(() => {
    const sorted = [...deals].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    if (!activeFilter) return sorted;
    return sorted.filter(d => (d.status || 'draft').toLowerCase() === activeFilter);
  }, [deals, activeFilter]);

  const handleNewDeal = useCallback(async () => {
    try {
      const res = await authFetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Deal ${new Date().toLocaleDateString()}` }),
      });
      if (!res.ok) throw new Error('API error');
      refetch();
    } catch (err) {
      console.error('Failed to create deal:', err);
      setError('Failed to create deal. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  }, [refetch]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 pt-5 pb-4 space-y-4">
        {error && (
          <div className="mx-4 mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold tracking-wide text-white/60">Deals</h2>
            <span className="text-[9px] font-mono text-white/30">{deals.length}</span>
          </div>
          <button
            onClick={handleNewDeal}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 text-white rounded text-[10px] font-bold tracking-wide hover:border-white/50 hover:bg-white/5 transition-colors"
          >
            <Plus className="w-3 h-3" /> New Deal
          </button>
        </div>

        <div className="flex items-center gap-1">
          {STATUSES.map((status, i) => {
            const count = statusCounts[status];
            const isActive = activeFilter === status;
            const config = STATUS_CONFIG[status];
            return (
              <React.Fragment key={status}>
                {i > 0 && <div className="w-4 h-px bg-white/5 shrink-0" />}
                <button
                  onClick={() => setActiveFilter(isActive ? null : status)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] font-bold tracking-wide transition-all ${
                    isActive
                      ? `${config.bg} ${config.color} ${config.border} border`
                      : count > 0
                        ? 'text-white/40 hover:bg-white/5'
                        : 'text-white/15'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${DOT_COLORS[status]}`} />
                  {config.label}
                  {count > 0 && (
                    <span className={`ml-0.5 ${isActive ? config.color : 'text-white/25'}`}>
                      {count}
                    </span>
                  )}
                </button>
              </React.Fragment>
            );
          })}
          {activeFilter && (
            <button
              onClick={() => setActiveFilter(null)}
              className="ml-2 text-[8px] text-white/30 hover:text-white/50 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-5 h-5 border-2 border-white/40 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredDeals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="w-14 h-14 rounded bg-white/5 border border-dashed border-white/10 flex items-center justify-center mb-4">
              <Briefcase className="w-6 h-6 text-white/15" />
            </div>
            <p className="text-sm font-semibold text-white/30">
              {activeFilter ? `No ${STATUS_CONFIG[activeFilter]?.label.toLowerCase()} deals` : 'No deals yet'}
            </p>
            <p className="text-[10px] text-white/15 mt-1 max-w-[240px] text-center">
              {activeFilter
                ? 'Try a different filter or create a new deal'
                : 'Build a flow in the workbench, then start a deal to bring it to life'
              }
            </p>
            {!activeFilter && (
                <button
                  onClick={handleNewDeal}
                  className="mt-4 flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-white/10 rounded text-[10px] font-bold text-white/50 hover:bg-white/10 hover:text-white/70 transition-all"
                >
                <Plus className="w-3 h-3" /> Create your first deal
              </button>
            )}
          </motion.div>
        ) : (
          <div className="space-y-1.5">
            <AnimatePresence mode="popLayout">
              {filteredDeals.map((deal, i) => {
                const status = (deal.status || 'draft').toLowerCase();
                const config = STATUS_CONFIG[status];
                return (
                  <motion.div
                    key={deal.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => window.location.href = `/deals/${deal.id}`}
                    className="flex items-center gap-4 px-4 py-3 bg-black/30 border border-white/10 rounded hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer group"
                  >
                    <span className={`w-2 h-2 rounded-full shrink-0 ${DOT_COLORS[status]}`} />

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white/80 truncate group-hover:text-white transition-colors">
                        {deal.title}
                      </p>
                    </div>

                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md ${config.bg} border ${config.border}`}>
                      <span className={`text-[8px] font-bold tracking-wide ${config.color}`}>
                        {config.label}
                      </span>
                    </div>

                    {deal.volume && (
                      <span className="text-[10px] font-mono text-white/25 hidden xl:block">{deal.volume}</span>
                    )}

                    <div className="flex items-center gap-1 text-white/20">
                      <Clock className="w-3 h-3" />
                      <span className="text-[9px] font-mono">{timeAgo(deal.updatedAt)}</span>
                    </div>

                    <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
