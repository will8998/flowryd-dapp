"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  Users, 
  ExternalLink,
} from 'lucide-react';
import { DataTable, Badge, useToast, EmptyState } from '@/components/ui';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'open' | 'negotiating' | 'locked' | 'committed';
  volume: string | null;
  flowId: string | null;
  createdBy: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
  participantsCount?: number;
}

interface DealsResponse {
  data: {
    deals: Deal[];
    total: number;
  };
}

const getValidTransitions = (currentStatus: string): string[] => {
  const transitions: Record<string, string[]> = {
    draft: ['open'],
    open: ['negotiating'],
    negotiating: ['locked'],
    locked: ['committed'],
    committed: [],
  };
  const result = [...(transitions[currentStatus] || [])];
  if (currentStatus !== 'draft') result.push('draft');
  return result;
};

export const AdminDealsTab: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchDeals();
  }, [page, pageSize, searchQuery, sortBy, sortDir, statusFilter]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      if (statusFilter) params.append('status', statusFilter);
      
      const response = await fetch(`/api/admin/deals?${params}`);
      if (response.ok) {
        const data: DealsResponse = await response.json();
        setDeals(data.data.deals || []);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to fetch deals', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      toast('Failed to fetch deals', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateDealStatus = async (dealId: string, newStatus: string) => {
    try {
      setActionLoading(dealId);
      const response = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast(`Deal status updated to ${newStatus}`, 'success');
        await fetchDeals();
      } else {
        toast('Failed to update deal status', 'error');
      }
    } catch (error) {
      console.error('Failed to update deal status:', error);
      toast('Failed to update deal status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkDelete = async (ids: Set<string>) => {
    try {
      const deletePromises = Array.from(ids).map(id => 
        fetch(`/api/deals/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      toast(`${ids.size} deals deleted successfully`, 'success');
      setSelectedIds(new Set());
      await fetchDeals();
    } catch (error) {
      console.error('Failed to delete deals:', error);
      toast('Failed to delete deals', 'error');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      committed: 'success',
      locked: 'warning',
      negotiating: 'info',
      open: 'default',
      draft: 'default'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (deal: Deal) => (
        <div>
          <div className="font-medium text-white">{deal.title}</div>
          {deal.description && (
            <div className="text-sm text-white/60 truncate max-w-xs">
              {deal.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (deal: Deal) => (
        <div className="flex items-center gap-2">
          {getStatusBadge(deal.status)}
          {getValidTransitions(deal.status).length > 0 && (
            <select
              value={deal.status}
              onChange={(e) => updateDealStatus(deal.id, e.target.value)}
              disabled={actionLoading === deal.id}
              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
            >
              <option value={deal.status}>{deal.status}</option>
              {getValidTransitions(deal.status).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          )}
        </div>
      ),
    },
    {
      key: 'volume',
      label: 'Volume',
      render: (deal: Deal) => (
        <span className="text-sm text-white/60">
          {deal.volume || 'Not specified'}
        </span>
      ),
    },
    {
      key: 'flowId',
      label: 'Flow ID',
      render: (deal: Deal) => (
        deal.flowId ? (
          <Link
            href={`/flows/${deal.flowId}`}
            className="text-sm text-white/60 hover:text-white underline"
          >
            {deal.flowId.slice(0, 8)}...
          </Link>
        ) : (
          <span className="text-white/20">—</span>
        )
      ),
    },
    {
      key: 'participantsCount',
      label: 'Participants Count',
      render: (deal: Deal) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-white/40" />
          <span className="text-sm text-white/60">
            {deal.participantsCount ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (deal: Deal) => (
        <span className="text-sm text-white/60">
          {formatDate(deal.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (deal: Deal) => (
        <Link
          href={`/deals/${deal.id}`}
          className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded text-sm font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-1"
        >
          View <ExternalLink className="w-3 h-3" />
        </Link>
      ),
    },
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: handleBulkDelete,
      variant: 'danger' as const,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col bg-[#020202] text-white"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Deals Management</h2>
            <p className="text-sm text-white/40 mt-1">Monitor and manage active deals</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-white/30 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="open">Open</option>
            <option value="negotiating">Negotiating</option>
            <option value="locked">Locked</option>
            <option value="committed">Committed</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DataTable
          columns={columns}
          data={deals}
          totalCount={totalCount}
          isLoading={loading}
          searchable
          searchPlaceholder="Search deals by title..."
          onSearch={handleSearch}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowId={(deal) => deal.id}
          bulkActions={bulkActions}
          exportable
          exportFilename="deals"
          emptyState={
            <EmptyState
              title="No deals found"
              description="No deals match your search criteria"
            />
          }
        />
      </div>
    </motion.div>
  );
};