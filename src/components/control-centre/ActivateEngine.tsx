"use client";

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Briefcase, Clock, ChevronRight, CheckCircle2, ExternalLink, X, Search, Archive, Copy, ArchiveRestore } from 'lucide-react';
import { useDeals } from '@/hooks/use-deals';
import { authFetch } from '@/lib/auth-fetch';
import { ListSkeleton } from './SkeletonLoaders';
import { ExportDropdown } from '@/components/ui/ExportDropdown';
import { formatDateForExport } from '@/lib/export-utils';

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

interface ActivateEngineProps {
  highlightDealId?: string | null;
  onHighlightConsumed?: () => void;
}

export const ActivateEngine: React.FC<ActivateEngineProps> = ({ highlightDealId, onHighlightConsumed }) => {
  const { deals, isLoading, refetch } = useDeals();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templates, setTemplates] = useState<{ id: string; name: string; description?: string; defaultTitle?: string; defaultFlowId?: string; milestonePresets?: unknown }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [successDealId, setSuccessDealId] = useState<string | null>(null);
  const [highlightFading, setHighlightFading] = useState(false);
  const highlightRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // When a new deal is created from NAVIGATE, refetch and show success
  useEffect(() => {
    if (highlightDealId) {
      refetch();
      setSuccessDealId(highlightDealId);
      setShowSuccessBanner(true);
      setHighlightFading(false);
      // Fade highlight after 5s
      const fadeTimer = setTimeout(() => setHighlightFading(true), 5000);
      // Remove highlight after fade animation (6s)
      const removeTimer = setTimeout(() => {
        setSuccessDealId(null);
        onHighlightConsumed?.();
      }, 6000);
      // Auto-dismiss banner after 8s
      const bannerTimer = setTimeout(() => setShowSuccessBanner(false), 8000);
      return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer); clearTimeout(bannerTimer); };
    }
  }, [highlightDealId, refetch, onHighlightConsumed]);

  // Scroll highlighted deal into view
  useEffect(() => {
    if (successDealId && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [successDealId, deals]);

  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    STATUSES.forEach(s => { counts[s] = 0; });
    deals.forEach((d) => {
      const s = (d.status || 'draft').toLowerCase();
      if (counts[s] !== undefined) counts[s]++;
    });
    return counts;
  }, [deals]);

  const filteredDeals = useMemo(() => {
    let sorted = [...deals].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    // Filter by status
    if (activeFilter) {
      sorted = sorted.filter(d => (d.status || 'draft').toLowerCase() === activeFilter);
    }
    
    // Filter by search query
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase().trim();
      sorted = sorted.filter(d => 
        d.title.toLowerCase().includes(query)
      );
    }
    
    return sorted;
  }, [deals, activeFilter, debouncedSearchQuery]);

  const handleArchiveDeal = useCallback(async (dealId: string, archive: boolean) => {
    try {
      const res = await authFetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ archive }),
      });
      if (!res.ok) throw new Error('API error');
      refetch();
    } catch (err) {
      console.error('Failed to archive deal:', err);
      setError('Failed to archive deal. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  }, [refetch]);

  const handleCloneDeal = useCallback(async (dealId: string) => {
    try {
      const res = await authFetch(`/api/deals/${dealId}/clone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('API error');
      refetch();
    } catch (err) {
      console.error('Failed to clone deal:', err);
      setError('Failed to clone deal. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  }, [refetch]);

  const fetchTemplates = useCallback(async () => {
    try {
      const res = await authFetch('/api/deal-templates');
      if (res.ok) {
        const json = await res.json();
        setTemplates(json.data?.templates ?? []);
      }
    } catch (err) {
      console.error('Failed to fetch templates:', err);
    }
  }, []);

  const handleCreateFromTemplate = useCallback(async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      const res = await authFetch('/api/deals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: template.defaultTitle || `Deal ${new Date().toLocaleDateString()}`,
          description: template.description,
          flowId: template.defaultFlowId,
        }),
      });
      if (!res.ok) throw new Error('API error');
      setShowTemplateModal(false);
      refetch();
    } catch (err) {
      console.error('Failed to create deal from template:', err);
      setError('Failed to create deal from template. Please try again.');
      setTimeout(() => setError(null), 5000);
    }
  }, [templates, refetch]);
  // Prepare export data
  const exportData = useMemo(() => {
    return filteredDeals.map(deal => ({
      title: deal.title,
      status: STATUS_CONFIG[(deal.status || 'draft').toLowerCase()]?.label || 'Draft',
      createdAt: formatDateForExport(deal.createdAt),
      updatedAt: formatDateForExport(deal.updatedAt),
      volume: deal.volume || '',
      flowId: deal.flowId || ''
    }));
  }, [filteredDeals]);

  const exportColumns = [
    { key: 'title', label: 'Title' },
    { key: 'status', label: 'Status' },
    { key: 'createdAt', label: 'Created At' },
    { key: 'updatedAt', label: 'Updated At' },
    { key: 'volume', label: 'Volume' },
    { key: 'flowId', label: 'Flow ID' }
  ];

  const handleNewDeal = useCallback(async () => {
    await fetchTemplates();
    if (templates.length > 0) {
      setShowTemplateModal(true);
    } else {
      // Create deal directly if no templates
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
    }
  }, [fetchTemplates, templates.length, refetch]);

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="px-6 pt-5 pb-4 space-y-4">
        {/* Success Banner */}
        <AnimatePresence>
          {showSuccessBanner && successDealId && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-sm text-emerald-300 font-medium">Deal created successfully</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.location.href = `/deals/${successDealId}`}
                  className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
                >
                  Open Deal Room <ExternalLink className="w-3 h-3" />
                </button>
                <button onClick={() => setShowSuccessBanner(false)} className="text-white/30 hover:text-white/60 transition-colors ml-2">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search deals..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 pl-9 pr-3 py-1.5 bg-black/30 border border-white/10 rounded text-[11px] text-white/80 placeholder-white/30 focus:border-white/30 focus:bg-white/[0.02] transition-colors"
          />
        </div>


        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold tracking-wide text-white/60">Deals</h2>
            <span className="text-[9px] font-mono text-white/30">{deals.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[9px] font-bold tracking-wide transition-all ${
                showArchived
                  ? 'bg-white/10 text-white/80 border border-white/20'
                  : 'text-white/40 hover:bg-white/5'
              }`}
            >
              <Archive className="w-3 h-3" />
              Show Archived
            </button>
            <button
              onClick={handleNewDeal}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 text-white rounded text-[10px] font-bold tracking-wide hover:border-white/50 hover:bg-white/5 transition-colors"
            >
              <Plus className="w-3 h-3" /> New Deal
            </button>
          </div>
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
          <ListSkeleton />
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
                    ref={deal.id === successDealId ? highlightRef : undefined}
                    key={deal.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={(e) => { e.stopPropagation(); window.location.href = `/deals/${deal.id}`; }}
                    className={`flex items-center gap-4 px-4 py-3 bg-black/30 border rounded hover:border-white/20 hover:bg-white/[0.02] transition-all cursor-pointer group ${
                      deal.archivedAt
                        ? 'opacity-50 bg-black/20 border-white/5'
                        : deal.id === successDealId
                          ? highlightFading
                            ? 'border-emerald-500/10 ring-0'
                            : 'border-emerald-500/40 ring-1 ring-emerald-500/20 bg-emerald-500/[0.03]'
                          : 'border-white/10'
                    }`}
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

                    {/* Action buttons */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneDeal(deal.id);
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        title="Clone deal"
                      >
                        <Copy className="w-3 h-3 text-white/40 hover:text-white/60" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveDeal(deal.id, !deal.archivedAt);
                        }}
                        className="p-1 rounded hover:bg-white/10 transition-colors"
                        title={deal.archivedAt ? 'Unarchive deal' : 'Archive deal'}
                      >
                        {deal.archivedAt ? (
                          <ArchiveRestore className="w-3 h-3 text-white/40 hover:text-white/60" />
                        ) : (
                          <Archive className="w-3 h-3 text-white/40 hover:text-white/60" />
                        )}
                      </button>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/15 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all shrink-0" />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Template Selection Modal */}
      <AnimatePresence>
        {showTemplateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowTemplateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-900 border border-white/10 rounded-lg p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Create Deal</h3>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="text-white/40 hover:text-white/60 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => {
                    setShowTemplateModal(false);
                    // Create blank deal
                    authFetch('/api/deals', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ title: `Deal ${new Date().toLocaleDateString()}` }),
                    }).then(() => refetch());
                  }}
                  className="w-full p-3 bg-white/5 border border-white/10 rounded text-left hover:bg-white/10 transition-colors"
                >
                  <div className="font-medium text-white">Blank Deal</div>
                  <div className="text-sm text-white/60">Start with an empty deal</div>
                </button>

                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleCreateFromTemplate(template.id)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded text-left hover:bg-white/10 transition-colors"
                  >
                    <div className="font-medium text-white">{template.name}</div>
                    {template.description && (
                      <div className="text-sm text-white/60">{template.description}</div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
