"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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
  data: AuditEntry[];
  pagination?: {
    cursor?: string;
    hasMore: boolean;
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
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const loadAuditLogs = async (resetCursor = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (!resetCursor && cursor) params.append('cursor', cursor);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/audit?${params}`);
      if (response.ok) {
        const data: AuditResponse = await response.json();
        if (resetCursor) {
          setAuditLogs(data.data);
        } else {
          setAuditLogs(prev => [...prev, ...data.data]);
        }
        setCursor(data.pagination?.cursor);
        setHasMore(data.pagination?.hasMore || false);
      } else {
        showBanner('error', 'Failed to load audit logs');
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      showBanner('error', 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuditLogs(true);
  }, [actionFilter, resourceTypeFilter, dateFrom, dateTo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionColor = (action: string) => {
    if (action.startsWith('user.')) return 'blue';
    if (action.startsWith('flow.')) return 'purple';
    if (action.startsWith('deal.')) return 'emerald';
    if (action.startsWith('room.')) return 'yellow';
    if (action.startsWith('message.')) return 'cyan';
    if (action.startsWith('file.')) return 'orange';
    return 'white';
  };

  const getActionBadgeClasses = (action: string) => {
    const color = getActionColor(action);
    switch (color) {
      case 'blue':
        return 'bg-blue-500/10 text-blue-400/60 border-blue-500/20';
      case 'purple':
        return 'bg-purple-500/10 text-purple-400/60 border-purple-500/20';
      case 'emerald':
        return 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20';
      case 'yellow':
        return 'bg-yellow-500/10 text-yellow-400/60 border-yellow-500/20';
      case 'cyan':
        return 'bg-cyan-500/10 text-cyan-400/60 border-cyan-500/20';
      case 'orange':
        return 'bg-orange-500/10 text-orange-400/60 border-orange-500/20';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      {banner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 p-3 rounded border text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400/60'
              : 'bg-red-500/10 border border-red-500/20 text-red-400/60'
          }`}
        >
          {banner.message}
        </motion.div>
      )}

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
        
        <div className="flex-1 overflow-auto">
          {loading && auditLogs.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/40">Loading audit logs...</div>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead className="sticky top-0 bg-white/5 border-b border-white/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Timestamp</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">User</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Action</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Resource</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Details</th>
                    <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map(entry => (
                    <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 text-sm text-white/60">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-white font-medium">{entry.userDisplayName}</div>
                          <div className="text-xs text-white/40 font-mono">{entry.userPartyId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 border rounded-full text-xs font-medium ${getActionBadgeClasses(entry.action)}`}>
                          {entry.action}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm text-white/80">{entry.resourceType}</div>
                          {entry.resourceId && (
                            <div className="text-xs text-white/40 font-mono truncate max-w-32">
                              {entry.resourceId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-white/60 max-w-48 truncate">
                          {JSON.stringify(entry.metadata)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-white/60 font-mono">
                        {entry.ipAddress}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {hasMore && (
                <div className="p-6 border-t border-white/5 text-center">
                  <button
                    onClick={() => loadAuditLogs(false)}
                    disabled={loading}
                    className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};