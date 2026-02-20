"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataTable, Badge, useToast, EmptyState } from '@/components/ui';

interface JoinRequest {
  id: string;
  flowId: string;
  flowTitle: string;
  requesterId: string;
  message: string | null;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

interface JoinRequestsResponse {
  data: {
    joinRequests: JoinRequest[];
    total: number;
  };
}

export const AdminJoinRequestsTab: React.FC = () => {
  const [joinRequests, setJoinRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [confirmAction, setConfirmAction] = useState<{ requestId: string; action: 'approved' | 'rejected' } | null>(null);

  const { toast } = useToast();

  const loadData = async () => {
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
      
      const response = await fetch(`/api/admin/join-requests?${params}`);
      if (response.ok) {
        const data: JoinRequestsResponse = await response.json();
        setJoinRequests(data.data.joinRequests || []);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load join requests', 'error');
      }
    } catch (error) {
      console.error('Failed to load join requests:', error);
      toast('Failed to load join requests', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    if (confirmAction?.requestId === requestId && confirmAction?.action === action) {
      // Second click - execute action
      try {
        const response = await fetch(`/api/admin/join-requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: action })
        });

        if (!response.ok) throw new Error(`Failed to ${action} request`);

        toast(`Request ${action} successfully`, 'success');
        setConfirmAction(null);
        await loadData();
      } catch (error) {
        console.error(`Failed to ${action} request:`, error);
        toast(`Failed to ${action} request`, 'error');
        setConfirmAction(null);
      }
    } else {
      // First click - show confirmation
      setConfirmAction({ requestId, action });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadData();
  }, [page, pageSize, searchQuery, sortBy, sortDir, statusFilter]);

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

  const getStatusBadge = (status: 'pending' | 'approved' | 'rejected') => {
    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info' | 'default'> = {
      pending: 'warning',
      approved: 'success',
      rejected: 'danger'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const columns = [
    {
      key: 'requesterId',
      label: 'Requester',
      sortable: true,
      render: (request: JoinRequest) => (
        <code className="text-xs text-white/80 bg-white/5 px-2 py-1 rounded font-mono">
          {request.requesterId}
        </code>
      ),
    },
    {
      key: 'flowTitle',
      label: 'Flow',
      render: (request: JoinRequest) => (
        <span className="text-sm text-white/80">{request.flowTitle}</span>
      ),
    },
    {
      key: 'message',
      label: 'Message',
      render: (request: JoinRequest) => (
        <div className="text-sm text-white/70 max-w-xs truncate">
          {request.message || (
            <span className="text-white/40 italic">No message</span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (request: JoinRequest) => getStatusBadge(request.status),
    },
    {
      key: 'createdAt',
      label: 'Submitted At',
      sortable: true,
      render: (request: JoinRequest) => (
        <div>
          <div className="text-sm text-white/60">
            {formatDate(request.createdAt)}
          </div>
          {request.reviewedAt && (
            <div className="text-xs text-white/40">
              Reviewed {formatDate(request.reviewedAt)}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (request: JoinRequest) => (
        request.status === 'pending' ? (
          <div className="flex gap-2">
            <button
              onClick={() => handleAction(request.id, 'approved')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                confirmAction?.requestId === request.id && confirmAction?.action === 'approved'
                  ? 'border border-white/40 bg-black/40 text-white' 
                  : 'border border-white/20 hover:border-white/40 text-white'
              }`}
            >
              {confirmAction?.requestId === request.id && confirmAction?.action === 'approved' 
                ? 'Confirm?' 
                : 'Approve'
              }
            </button>
            <button
              onClick={() => handleAction(request.id, 'rejected')}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                confirmAction?.requestId === request.id && confirmAction?.action === 'rejected'
                  ? 'border border-white/40 bg-black/40 text-white' 
                  : 'border border-white/20 hover:border-white/40 text-white'
              }`}
            >
              {confirmAction?.requestId === request.id && confirmAction?.action === 'rejected' 
                ? 'Confirm?' 
                : 'Reject'
              }
            </button>
          </div>
        ) : (
          <span className="text-white/40 text-sm">—</span>
        )
      ),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Join Requests Management</h2>
            <p className="text-sm text-white/40 mt-1">Review and manage flow join requests</p>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-white/30 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DataTable
          columns={columns}
          data={joinRequests}
          totalCount={totalCount}
          isLoading={loading}
          searchable
          searchPlaceholder="Search by requester ID..."
          onSearch={handleSearch}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          exportable
          exportFilename="join-requests"
          getRowId={(request) => request.id}
          emptyState={
            <EmptyState
              title="No join requests found"
              description="No join requests match your search criteria"
            />
          }
        />
      </div>
    </motion.div>
  );
};