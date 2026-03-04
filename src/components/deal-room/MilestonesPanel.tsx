"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown, 
  Minus,
  Edit3,
  Trash2,
  MessageSquare
} from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';

interface Milestone {
  id: string;
  dealId: string;
  title: string;
  description?: string;
  dueDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  order: number;
  completedAt?: string;
  completedBy?: string;
  completedByName?: string;
  createdAt: string;
  updatedAt: string;
}

interface Vote {
  id: string;
  dealId: string;
  milestoneId: string;
  userId: string;
  vote: 'approve' | 'reject' | 'abstain';
  comment?: string;
  createdAt: string;
  userDisplayName?: string;
  userPartyId?: string;
}

interface VoteSummary {
  approve: number;
  reject: number;
  abstain: number;
  total: number;
}

interface MilestonesPanelProps {
  dealId: string;
  participants: Array<{ id: string; userId: string; role: string | null; displayName?: string | null }>;
}

export default function MilestonesPanel({ dealId, participants }: MilestonesPanelProps) {
  const { user } = useCantonAuth();
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [votes, setVotes] = useState<Record<string, { votes: Vote[]; summary: VoteSummary }>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<string | null>(null);
  const [votingMilestone, setVotingMilestone] = useState<string | null>(null);

  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    dueDate: '',
    order: 0,
  });

  const currentUserParticipant = participants.find(p => p.userId === user?.id);
  const canManageMilestones = !!currentUserParticipant;

  useEffect(() => {
    fetchMilestones();
  }, [dealId]);

  const fetchMilestones = async () => {
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones`);
      if (response.ok) {
        const data = await response.json();
        setMilestones(data.milestones || []);
        
        // Fetch votes for each milestone
        for (const milestone of data.milestones || []) {
          fetchVotes(milestone.id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch milestones:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVotes = async (milestoneId: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones/${milestoneId}/votes`);
      if (response.ok) {
        const data = await response.json();
        setVotes(prev => ({
          ...prev,
          [milestoneId]: {
            votes: data.votes || [],
            summary: data.summary || { approve: 0, reject: 0, abstain: 0, total: 0 }
          }
        }));
      }
    } catch (error) {
      console.error('Failed to fetch votes:', error);
    }
  };

  const createMilestone = async () => {
    if (!newMilestone.title.trim()) return;

    try {
      const response = await fetch(`/api/deals/${dealId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newMilestone,
          dueDate: newMilestone.dueDate || undefined,
        }),
      });

      if (response.ok) {
        setNewMilestone({ title: '', description: '', dueDate: '', order: 0 });
        setShowAddForm(false);
        fetchMilestones();
      }
    } catch (error) {
      console.error('Failed to create milestone:', error);
    }
  };

  const updateMilestoneStatus = async (milestoneId: string, status: Milestone['status']) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchMilestones();
      }
    } catch (error) {
      console.error('Failed to update milestone:', error);
    }
  };

  const deleteMilestone = async (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const response = await fetch(`/api/deals/${dealId}/milestones/${milestoneId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchMilestones();
      }
    } catch (error) {
      console.error('Failed to delete milestone:', error);
    }
  };

  const castVote = async (milestoneId: string, vote: 'approve' | 'reject' | 'abstain', comment?: string) => {
    try {
      const response = await fetch(`/api/deals/${dealId}/milestones/${milestoneId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote, comment }),
      });

      if (response.ok) {
        fetchVotes(milestoneId);
        setVotingMilestone(null);
      }
    } catch (error) {
      console.error('Failed to cast vote:', error);
    }
  };

  const getStatusColor = (status: Milestone['status']) => {
    switch (status) {
      case 'pending': return 'text-zinc-400 bg-zinc-500/10';
      case 'in_progress': return 'text-blue-400 bg-blue-500/10';
      case 'completed': return 'text-emerald-400 bg-emerald-500/10';
      case 'overdue': return 'text-red-400 bg-red-500/10';
      default: return 'text-zinc-400 bg-zinc-500/10';
    }
  };

  const getStatusIcon = (status: Milestone['status']) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'in_progress': return <Clock className="w-3 h-3" />;
      case 'completed': return <CheckCircle2 className="w-3 h-3" />;
      case 'overdue': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const getUserVote = (milestoneId: string) => {
    const milestoneVotes = votes[milestoneId]?.votes || [];
    return milestoneVotes.find(v => v.userId === user?.id);
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="w-4 h-4 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white/80">Milestones</h3>
        {canManageMilestones && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-6 h-6 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
          >
            <Plus className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Add Milestone Form */}
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-3"
            >
              <input
                type="text"
                placeholder="Milestone title"
                value={newMilestone.title}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, title: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 placeholder-white/40 focus:outline-none focus:border-white/20"
              />
              <textarea
                placeholder="Description (optional)"
                value={newMilestone.description}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, description: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 placeholder-white/40 focus:outline-none focus:border-white/20 resize-none"
                rows={2}
              />
              <input
                type="datetime-local"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white/80 focus:outline-none focus:border-white/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={createMilestone}
                  className="px-3 py-1.5 bg-white/10 border border-white/20 text-white/80 rounded text-xs font-bold hover:bg-white/15 transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-white/40 text-xs hover:text-white/60 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Milestones Timeline */}
        {milestones.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-white/40 text-xs">No milestones yet</p>
            {canManageMilestones && (
              <button
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-white/60 text-xs hover:text-white/80 transition-colors"
              >
                Create the first milestone
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {milestones.map((milestone, index) => {
              const milestoneVotes = votes[milestone.id];
              const userVote = getUserVote(milestone.id);
              const isOverdue = milestone.dueDate && new Date(milestone.dueDate) < new Date() && milestone.status !== 'completed';

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative"
                >
                  {/* Timeline connector */}
                  {index < milestones.length - 1 && (
                    <div className="absolute left-3 top-8 w-0.5 h-6 bg-white/10" />
                  )}

                  <div className="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                    {/* Milestone Header */}
                    <div className="flex items-start gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getStatusColor(isOverdue ? 'overdue' : milestone.status)}`}>
                        {getStatusIcon(isOverdue ? 'overdue' : milestone.status)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white/80 truncate">{milestone.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold tracking-wide ${getStatusColor(isOverdue ? 'overdue' : milestone.status)}`}>
                            {isOverdue ? 'OVERDUE' : milestone.status.toUpperCase()}
                          </span>
                        </div>
                        
                        {milestone.description && (
                          <p className="text-xs text-white/60 mt-1">{milestone.description}</p>
                        )}
                        
                        {milestone.dueDate && (
                          <div className="flex items-center gap-1 mt-1">
                            <Calendar className="w-3 h-3 text-white/40" />
                            <span className="text-[10px] text-white/40">
                              Due {new Date(milestone.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {milestone.completedAt && milestone.completedByName && (
                          <p className="text-[10px] text-emerald-400 mt-1">
                            Completed by {milestone.completedByName} on {new Date(milestone.completedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>

                      {canManageMilestones && (
                        <div className="flex gap-1">
                          <button
                            onClick={() => setEditingMilestone(milestone.id)}
                            className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => deleteMilestone(milestone.id)}
                            className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          >
                            <Trash2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Status Actions */}
                    {canManageMilestones && milestone.status !== 'completed' && (
                      <div className="flex gap-2">
                        {milestone.status === 'pending' && (
                          <button
                            onClick={() => updateMilestoneStatus(milestone.id, 'in_progress')}
                            className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded text-[10px] font-bold hover:bg-blue-500/20 transition-colors"
                          >
                            Start
                          </button>
                        )}
                        {milestone.status === 'in_progress' && (
                          <button
                            onClick={() => updateMilestoneStatus(milestone.id, 'completed')}
                            className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                    )}

                    {/* Voting Section */}
                    {milestoneVotes && (
                      <div className="border-t border-white/5 pt-2 space-y-2">
                        {/* Vote Summary */}
                        <div className="flex items-center gap-3 text-[10px]">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{milestoneVotes.summary.approve}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="w-3 h-3 text-red-400" />
                            <span className="text-red-400">{milestoneVotes.summary.reject}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Minus className="w-3 h-3 text-zinc-400" />
                            <span className="text-zinc-400">{milestoneVotes.summary.abstain}</span>
                          </div>
                          <span className="text-white/40 ml-auto">
                            {milestoneVotes.summary.total} / {participants.length} voted
                          </span>
                        </div>

                        {/* User's Vote */}
                        {userVote ? (
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-white/40">Your vote:</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold ${
                              userVote.vote === 'approve' ? 'bg-emerald-500/10 text-emerald-400' :
                              userVote.vote === 'reject' ? 'bg-red-500/10 text-red-400' :
                              'bg-zinc-500/10 text-zinc-400'
                            }`}>
                              {userVote.vote.toUpperCase()}
                            </span>
                            <button
                              onClick={() => setVotingMilestone(milestone.id)}
                              className="text-[10px] text-white/40 hover:text-white/60 transition-colors"
                            >
                              Change
                            </button>
                          </div>
                        ) : canManageMilestones && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => castVote(milestone.id, 'approve')}
                              className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold hover:bg-emerald-500/20 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => castVote(milestone.id, 'reject')}
                              className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-[10px] font-bold hover:bg-red-500/20 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => castVote(milestone.id, 'abstain')}
                              className="px-2 py-1 bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 rounded text-[10px] font-bold hover:bg-zinc-500/20 transition-colors"
                            >
                              Abstain
                            </button>
                          </div>
                        )}

                        {/* Vote Comments */}
                        {milestoneVotes.votes.filter(v => v.comment).length > 0 && (
                          <div className="space-y-1">
                            {milestoneVotes.votes.filter(v => v.comment).map(vote => (
                              <div key={vote.id} className="bg-white/5 rounded p-2">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-[10px] font-semibold text-white/60">
                                    {vote.userDisplayName || vote.userPartyId}
                                  </span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                    vote.vote === 'approve' ? 'bg-emerald-500/10 text-emerald-400' :
                                    vote.vote === 'reject' ? 'bg-red-500/10 text-red-400' :
                                    'bg-zinc-500/10 text-zinc-400'
                                  }`}>
                                    {vote.vote.toUpperCase()}
                                  </span>
                                </div>
                                <p className="text-[10px] text-white/50">{vote.comment}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}