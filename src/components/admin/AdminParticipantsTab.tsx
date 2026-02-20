"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { useToast, EmptyState } from '@/components/ui';

interface Participant {
  id: string;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  roles: string[];
  verificationStatus: 'unclaimed' | 'pending' | 'approved' | 'verified' | 'rejected';
  claimedByUserId: string | null;
  claimedByOrgId: string | null;
  claimedAt: string | null;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  contactEmail: string | null;
  contactName: string | null;
  createdAt: string;
  updatedAt: string;
  claimedByUser?: {
    displayName: string;
    email: string | null;
  };
  claimedByOrg?: {
    name: string;
  };
}

interface ParticipantsResponse {
  data: {
    participants: Participant[];
    total: number;
  };
}

const STATUS_COLORS = {
  unclaimed: 'bg-gray-500/20 text-gray-400 border-gray-500',
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500',
  approved: 'bg-green-500/20 text-green-400 border-green-500',
  verified: 'bg-blue-500/20 text-blue-400 border-blue-500',
  rejected: 'bg-red-500/20 text-red-400 border-red-500'
};

const STATUS_LABELS = {
  unclaimed: 'Unclaimed',
  pending: 'Pending Review',
  approved: 'Approved',
  verified: 'Verified',
  rejected: 'Rejected'
};

export const AdminParticipantsTab: React.FC = () => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [actioningIds, setActioningIds] = useState<Set<string>>(new Set());
  const [rejectModal, setRejectModal] = useState<{ participantId: string; participantName: string } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const { toast } = useToast();

  const loadParticipants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }
      
      const response = await fetch(`/api/admin/participants?${params}`);
      if (!response.ok) throw new Error('Failed to fetch participants');
      
      const data: ParticipantsResponse = await response.json();
      setParticipants(data.data?.participants || []);
      setTotalCount(data.data?.total || 0);
    } catch (error) {
      console.error('Failed to load participants:', error);
      toast('Failed to load participants', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (participantId: string) => {
    try {
      setActioningIds(prev => new Set([...prev, participantId]));
      
      const response = await fetch(`/api/admin/participants/${participantId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' })
      });

      if (response.ok) {
        toast('Participant approved successfully', 'success');
        await loadParticipants();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to approve participant', 'error');
      }
    } catch (error) {
      console.error('Failed to approve participant:', error);
      toast('Failed to approve participant', 'error');
    } finally {
      setActioningIds(prev => {
        const updated = new Set(prev);
        updated.delete(participantId);
        return updated;
      });
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectionReason.trim()) return;

    try {
      setActioningIds(prev => new Set([...prev, rejectModal.participantId]));
      
      const response = await fetch(`/api/admin/participants/${rejectModal.participantId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          action: 'reject', 
          rejectionReason: rejectionReason.trim() 
        })
      });

      if (response.ok) {
        toast('Participant rejected', 'success');
        setRejectModal(null);
        setRejectionReason('');
        await loadParticipants();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to reject participant', 'error');
      }
    } catch (error) {
      console.error('Failed to reject participant:', error);
      toast('Failed to reject participant', 'error');
    } finally {
      setActioningIds(prev => {
        const updated = new Set(prev);
        updated.delete(rejectModal.participantId);
        return updated;
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const toggleRowExpansion = (participantId: string) => {
    setExpandedRows(prev => {
      const updated = new Set(prev);
      if (updated.has(participantId)) {
        updated.delete(participantId);
      } else {
        updated.add(participantId);
      }
      return updated;
    });
  };

  useEffect(() => {
    loadParticipants();
  }, [page, pageSize, searchQuery, statusFilter, sortBy, sortDir, loadParticipants]);

  const renderExpandedRow = (participant: Participant) => (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="bg-white/5 border-t border-white/5 p-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="text-white/80 font-medium mb-2">Company Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Description:</span>
                <span className="text-white/80 max-w-xs text-right">{participant.description || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Website:</span>
                <span className="text-white/80">
                  {participant.website ? (
                    <a href={participant.website} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">
                      {participant.website}
                    </a>
                  ) : 'None'}
                </span>
              </div>
              <div>
                <span className="text-white/60">All Roles:</span>
                <div className="flex flex-wrap gap-1 mt-2">
                  {participant.roles.map((role) => (
                    <span 
                      key={role}
                      className="px-2 py-1 bg-white/10 rounded text-xs text-white/80"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-white/80 font-medium mb-2">Contact Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Contact Name:</span>
                <span className="text-white/80">{participant.contactName || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Contact Email:</span>
                <span className="text-white/80">{participant.contactEmail || 'None'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Created:</span>
                <span className="text-white/80">{formatDate(participant.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Last Updated:</span>
                <span className="text-white/80">{formatDate(participant.updatedAt)}</span>
              </div>
            </div>
          </div>

          {participant.rejectionReason && (
            <div className="bg-red-500/10 border border-red-500/20 rounded p-3">
              <h4 className="text-red-400 font-medium mb-1">Rejection Reason</h4>
              <p className="text-red-400/80 text-sm">{participant.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col"
    >
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 border border-white/20 rounded">
              <Building2 className="w-6 h-6 text-white/70" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Participants</h2>
              <p className="text-white/60 text-sm mt-1">Review and manage participant claims</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30"
              />
            </div>
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-8 py-2 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-white/30"
            >
              <option value="all">All Statuses</option>
              <option value="unclaimed">Unclaimed</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border border-white/5 rounded-lg p-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-white/5 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-white/5 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : participants.length === 0 ? (
          <EmptyState
            title="No participants found"
            description="No participant profiles match your current filters"
          />
        ) : (
          <div className="space-y-2">
            {participants.map((participant) => (
              <div key={participant.id} className="border border-white/5 rounded-lg overflow-hidden">
                <div className="p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => toggleRowExpansion(participant.id)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      {expandedRows.has(participant.id) ? (
                        <ChevronDown className="w-4 h-4 text-white/60" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-white/60" />
                      )}
                    </button>

                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white/70" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium">{participant.name}</h3>
                        {participant.description && (
                          <p className="text-white/60 text-sm truncate max-w-md">{participant.description}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-white/80 text-sm font-medium">
                          {participant.roles.length} {participant.roles.length === 1 ? 'Role' : 'Roles'}
                        </div>
                        <div className="text-white/60 text-xs">
                          {participant.roles.slice(0, 2).join(', ')}
                          {participant.roles.length > 2 && ` +${participant.roles.length - 2}`}
                        </div>
                      </div>

                      <div className="text-center">
                        <span className={`inline-flex items-center px-2 py-1 border rounded-full text-xs font-medium ${
                          STATUS_COLORS[participant.verificationStatus]
                        }`}>
                          {STATUS_LABELS[participant.verificationStatus]}
                        </span>
                        <div className="text-white/60 text-xs mt-1">
                          {participant.claimedByUser?.displayName || 'Unclaimed'}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {participant.verificationStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(participant.id)}
                              disabled={actioningIds.has(participant.id)}
                              className="px-3 py-1.5 border border-green-500/50 hover:border-green-500 text-green-400 rounded text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {actioningIds.has(participant.id) ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectModal({ participantId: participant.id, participantName: participant.name })}
                              disabled={actioningIds.has(participant.id)}
                              className="px-3 py-1.5 border border-red-500/50 hover:border-red-500 text-red-400 rounded text-sm font-medium transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <XCircle className="w-3 h-3" />
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {expandedRows.has(participant.id) && renderExpandedRow(participant)}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}

        {participants.length > 0 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/5">
            <div className="text-sm text-white/60">
              Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} participants
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-white/80">
                Page {page} of {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPage(Math.min(Math.ceil(totalCount / pageSize), page + 1))}
                disabled={page >= Math.ceil(totalCount / pageSize)}
                className="px-3 py-1 border border-white/10 hover:border-white/20 text-white/60 hover:text-white rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {rejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#020202] border border-white/10 rounded-lg p-6 w-full max-w-md mx-4"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/20 border border-red-500 rounded">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Reject Participant</h3>
                  <p className="text-white/60 text-sm">{rejectModal.participantName}</p>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white/80 mb-2">
                  Rejection Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                  placeholder="Please provide a reason for rejection..."
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRejectModal(null);
                    setRejectionReason('');
                  }}
                  className="flex-1 px-4 py-2 text-white/60 hover:text-white border border-white/10 rounded hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim()}
                  className="flex-1 px-4 py-2 border border-red-500 hover:border-red-400 text-red-400 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reject
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};