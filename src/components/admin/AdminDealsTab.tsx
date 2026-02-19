"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  Search, 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Trash2, 
  Plus,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Calendar,
  User
} from 'lucide-react';

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
}

interface Participant {
  id: string;
  userId: string;
  role: string | null;
  joinedAt: string | null;
  displayName: string | null;
  partyId: string | null;
}

interface Banner {
  type: 'success' | 'error';
  message: string;
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
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [participantsLoading, setParticipantsLoading] = useState<string | null>(null);
  
  const [addUserId, setAddUserId] = useState('');
  const [addRole, setAddRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);
  
  const [banner, setBanner] = useState<Banner | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchDeals();
  }, []);

  // Auto-dismiss banner after 3s
  useEffect(() => {
    if (banner) {
      const timer = setTimeout(() => {
        setBanner(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [banner]);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
  };

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/deals?limit=50');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.data || []);
      } else {
        showBanner('error', 'Failed to fetch deals');
      }
    } catch (error) {
      console.error('Failed to fetch deals:', error);
      showBanner('error', 'Failed to fetch deals');
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipants = async (dealId: string) => {
    try {
      setParticipantsLoading(dealId);
      const response = await fetch(`/api/deals/${dealId}`);
      if (response.ok) {
        const data = await response.json();
        setParticipants(prev => ({
          ...prev,
          [dealId]: data.data.participants || []
        }));
      } else {
        showBanner('error', 'Failed to fetch participants');
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      showBanner('error', 'Failed to fetch participants');
    } finally {
      setParticipantsLoading(null);
    }
  };

  const toggleExpanded = async (dealId: string) => {
    if (expandedDealId === dealId) {
      setExpandedDealId(null);
    } else {
      setExpandedDealId(dealId);
      if (!participants[dealId]) {
        await fetchParticipants(dealId);
      }
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
        showBanner('success', `Deal status updated to ${newStatus}`);
        await fetchDeals();
      } else {
        showBanner('error', 'Failed to update deal status');
      }
    } catch (error) {
      console.error('Failed to update deal status:', error);
      showBanner('error', 'Failed to update deal status');
    } finally {
      setActionLoading(null);
    }
  };

  const addParticipant = async (dealId: string) => {
    if (!addUserId.trim()) return;

    try {
      setActionLoading(dealId);
      const response = await fetch(`/api/deals/${dealId}/participants`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: addUserId, role: addRole })
      });

      if (response.ok) {
        showBanner('success', 'Participant added successfully');
        setAddUserId('');
        setAddRole('viewer');
        await fetchParticipants(dealId);
      } else {
        showBanner('error', 'Failed to add participant');
      }
    } catch (error) {
      console.error('Failed to add participant:', error);
      showBanner('error', 'Failed to add participant');
    } finally {
      setActionLoading(null);
    }
  };

  const removeParticipant = async (dealId: string, userId: string) => {
    try {
      setActionLoading(userId);
      const response = await fetch(`/api/deals/${dealId}/participants`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (response.ok) {
        showBanner('success', 'Participant removed successfully');
        await fetchParticipants(dealId);
        setConfirmRemoveId(null);
      } else {
        showBanner('error', 'Failed to remove participant');
      }
    } catch (error) {
      console.error('Failed to remove participant:', error);
      showBanner('error', 'Failed to remove participant');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemoveClick = (participantId: string) => {
    if (confirmRemoveId === participantId) {
      const participant = Object.values(participants).flat().find(p => p.id === participantId);
      if (participant) {
        const dealId = expandedDealId!;
        removeParticipant(dealId, participant.userId);
      }
    } else {
      setConfirmRemoveId(participantId);
      // Clear confirmation after 3 seconds
      setTimeout(() => {
        if (confirmRemoveId === participantId) {
          setConfirmRemoveId(null);
        }
      }, 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'committed':
        return (
          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium px-2 py-1">
            Committed
          </span>
        );
      case 'locked':
        return (
          <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-xs font-medium px-2 py-1">
            Locked
          </span>
        );
      case 'negotiating':
        return (
          <span className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-full text-xs font-medium px-2 py-1">
            Negotiating
          </span>
        );
      case 'open':
        return (
          <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full text-xs font-medium px-2 py-1">
            Open
          </span>
        );
      case 'draft':
        return (
          <span className="bg-gray-500/20 text-gray-400 border border-gray-500/30 rounded-full text-xs font-medium px-2 py-1">
            Draft
          </span>
        );
      default:
        return (
          <span className="bg-white/20 text-white/40 border border-white/30 rounded-full text-xs font-medium px-2 py-1">
            {status}
          </span>
        );
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         (deal.description || '').toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = !statusFilter || deal.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col bg-[#020202] text-white"
    >
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`px-6 py-3 border-b flex items-center gap-3 ${
              banner.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            {banner.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{banner.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Deals Management</h2>
            <p className="text-sm text-white/40 mt-1">Monitor and manage active deals</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search deals..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50 transition-colors"
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

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/40">Loading deals...</div>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/40">No deals found</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-white/5 border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Title</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Volume</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Participants</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Created</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDeals.map((deal) => (
                <React.Fragment key={deal.id}>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleExpanded(deal.id)}
                          className="p-1 hover:bg-white/10 rounded transition-colors"
                        >
                          <ChevronRight 
                            className={`w-4 h-4 text-white/40 transition-transform ${
                              expandedDealId === deal.id ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                        <div>
                          <div className="font-medium text-white">{deal.title}</div>
                          {deal.description && (
                            <div className="text-sm text-white/60 truncate max-w-xs">
                              {deal.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(deal.status)}
                        {getValidTransitions(deal.status).length > 0 && (
                          <select
                            value={deal.status}
                            onChange={(e) => updateDealStatus(deal.id, e.target.value)}
                            disabled={actionLoading === deal.id}
                            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-blue-500/50 disabled:opacity-50"
                          >
                            <option value={deal.status}>{deal.status}</option>
                            {getValidTransitions(deal.status).map(status => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/60">
                        {deal.volume || 'Not specified'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/60">
                          {participants[deal.id]?.length ?? '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {formatDate(deal.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleExpanded(deal.id)}
                          className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                        >
                          Manage
                        </button>
                        <Link
                          href={`/deals/${deal.id}`}
                          className="px-3 py-1.5 bg-white/5 text-white/60 border border-white/10 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors inline-flex items-center gap-1"
                        >
                          View <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>

                  {expandedDealId === deal.id && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-bold text-white/80">Participants</h4>
                            {participants[deal.id] && (
                              <span className="text-xs text-white/40">
                                {participants[deal.id].length} participants
                              </span>
                            )}
                          </div>

                          {participantsLoading === deal.id ? (
                            <div className="text-center py-4">
                              <div className="text-white/40">Loading participants...</div>
                            </div>
                          ) : (
                            <>
                              <div className="bg-white/5 rounded-lg p-4">
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                  {participants[deal.id]?.map((participant) => (
                                    <div key={participant.id} className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                                          <User className="w-4 h-4 text-blue-400" />
                                        </div>
                                        <div>
                                          <div className="text-sm font-medium text-white">
                                            {participant.displayName || participant.partyId || 'Unknown'}
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-white/40">
                                            {participant.role && (
                                              <span className="bg-white/10 px-2 py-0.5 rounded text-white/60">
                                                {participant.role}
                                              </span>
                                            )}
                                            {participant.joinedAt && (
                                              <span className="flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {formatDate(participant.joinedAt)}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        onClick={() => handleRemoveClick(participant.id)}
                                        disabled={actionLoading === participant.userId}
                                        className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                                          confirmRemoveId === participant.id
                                            ? 'text-red-400 hover:bg-red-500/20'
                                            : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                                        }`}
                                        title={confirmRemoveId === participant.id ? 'Click again to remove' : 'Remove participant'}
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="bg-white/5 rounded-lg p-4">
                                <h5 className="text-sm font-medium text-white mb-3">Add Participant</h5>
                                <div className="flex items-center gap-3">
                                  <input
                                    type="text"
                                    placeholder="User ID"
                                    value={addUserId}
                                    onChange={(e) => setAddUserId(e.target.value)}
                                    className="flex-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                                  />
                                  <select
                                    value={addRole}
                                    onChange={(e) => setAddRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-blue-500/50"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <button
                                    onClick={() => addParticipant(deal.id)}
                                    disabled={!addUserId.trim() || actionLoading === deal.id}
                                    className="px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-sm font-medium hover:bg-emerald-500/30 transition-colors disabled:opacity-50 flex items-center gap-2"
                                  >
                                    <Plus className="w-4 h-4" />
                                    Add
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </motion.div>
  );
};