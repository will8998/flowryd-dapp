"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DataTable, Badge, useToast, EmptyState } from '@/components/ui';

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
  userDisplayName: string;
  userPartyId: string;
}

interface AuditResponse {
  data: {
    audit: AuditEntry[];
    total: number;
  };
}

const AUDIT_ACTIONS = [
  'user.register', 'user.login', 'user.logout', 'user.role_change',
  'flow.create', 'flow.update', 'flow.publish', 'flow.delete', 'flow.version',
  'deal.create', 'deal.status_change', 'deal.participant_add', 'deal.participant_remove',
  'room.create', 'room.join', 'room.leave', 'message.send', 'file.upload'
];

const RESOURCE_TYPES = ['user', 'flow', 'flow_version', 'deal', 'join_request', 'message', 'file'];

export const AdminAuditTab: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { toast } = useToast();

  const loadAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);

      const response = await fetch(`/api/admin/audit?${params}`);
      if (response.ok) {
        const data: AuditResponse = await response.json();
        setAuditLogs(data.data.audit);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load audit logs', 'error');
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      toast('Failed to load audit logs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadAuditLogs();
  }, [page, pageSize, searchQuery, sortBy, sortDir, actionFilter, resourceTypeFilter, dateFrom, dateTo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const _getActionColor = (action: string) => {
    if (action.startsWith('user.')) return 'blue';
    if (action.startsWith('flow.')) return 'purple';
    if (action.startsWith('deal.')) return 'emerald';
    if (action.startsWith('room.')) return 'yellow';
    if (action.startsWith('message.')) return 'cyan';
    if (action.startsWith('file.')) return 'orange';
    return 'white';
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const _handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const columns = [
    {
      key: 'createdAt',
      label: 'Timestamp',
      sortable: true,
      render: (entry: AuditEntry) => (
        <span className="text-sm text-white/60">
          {formatDate(entry.createdAt)}
        </span>
      ),
    },
    {
      key: 'user',
      label: 'User',
      render: (entry: AuditEntry) => (
        <div>
          <div className="text-sm text-white font-medium">{entry.userDisplayName}</div>
          <div className="text-xs text-white/40 font-mono">{entry.userPartyId}</div>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (entry: AuditEntry) => (
        <Badge variant="default">
          {entry.action}
        </Badge>
      ),
    },
    {
      key: 'resourceType',
      label: 'Resource Type',
      render: (entry: AuditEntry) => (
        <span className="text-sm text-white/80">{entry.resourceType}</span>
      ),
    },
    {
      key: 'resourceId',
      label: 'Resource ID',
      render: (entry: AuditEntry) => (
        entry.resourceId ? (
          <code className="text-xs text-white/40 font-mono truncate max-w-32 block">
            {entry.resourceId}
          </code>
        ) : (
          <span className="text-white/20">—</span>
        )
      ),
    },
    {
      key: 'ipAddress',
      label: 'IP Address',
      render: (entry: AuditEntry) => (
        <code className="text-sm text-white/60 font-mono">
          {entry.ipAddress}
        </code>
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
      <div className="flex gap-4 mb-6">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-white/5 border border-white/5 hover:border-white/10 rounded px-3 py-2 text-sm text-white"
        >
          <option value="">All Actions</option>
          {AUDIT_ACTIONS.map(action => (
            <option key={action} value={action}>{action}</option>
          ))}
        </select>

        <select
          value={resourceTypeFilter}
          onChange={(e) => setResourceTypeFilter(e.target.value)}
          className="bg-white/5 border border-white/5 hover:border-white/10 rounded px-3 py-2 text-sm text-white"
        >
          <option value="">All Resources</option>
          {RESOURCE_TYPES.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-white/5 border border-white/5 hover:border-white/10 rounded px-3 py-2 text-sm text-white"
          placeholder="From date"
        />

        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-white/5 border border-white/5 hover:border-white/10 rounded px-3 py-2 text-sm text-white"
          placeholder="To date"
        />
      </div>

      <div className="bg-black/20 border border-white/5 rounded flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">System Audit Log</h2>
          <p className="text-sm text-white/40 mt-1">Track all system activities and changes</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <DataTable
            columns={columns}
            data={auditLogs}
            totalCount={totalCount}
            isLoading={loading}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            exportable
            exportFilename="audit-log"
            getRowId={(entry) => entry.id}
            emptyState={
              <EmptyState
                title="No audit logs found"
                description="No audit entries match your search criteria"
              />
            }
          />
        </div>
      </div>
    </motion.div>
  );
};