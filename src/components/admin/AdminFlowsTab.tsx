"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Edit3, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  Play, 
  Archive, 
  RotateCcw,
  FileText,
  ChevronDown,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface Flow {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  isTemplate: boolean | null;
  isPublic: boolean | null;
  workflowType: string | null;
  createdBy: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

interface Banner {
  type: 'success' | 'error';
  message: string;
}

export const AdminFlowsTab: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchFlows();
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

  const fetchFlows = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flows?limit=50');
      if (response.ok) {
        const data = await response.json();
        setFlows(data.data || []);
      } else {
        showBanner('error', 'Failed to fetch flows');
      }
    } catch (error) {
      console.error('Failed to fetch flows:', error);
      showBanner('error', 'Failed to fetch flows');
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (flow: Flow) => {
    setEditingId(flow.id);
    setEditTitle(flow.title);
    setEditDescription(flow.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEditing = async () => {
    if (!editingId) return;
    
    try {
      setActionLoading(editingId);
      const response = await fetch(`/api/flows/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: editTitle,
          description: editDescription || null
        })
      });

      if (response.ok) {
        showBanner('success', 'Flow updated successfully');
        await fetchFlows();
        cancelEditing();
      } else {
        showBanner('error', 'Failed to update flow');
      }
    } catch (error) {
      console.error('Failed to update flow:', error);
      showBanner('error', 'Failed to update flow');
    } finally {
      setActionLoading(null);
    }
  };

  const togglePublic = async (flowId: string, currentIsPublic: boolean | null) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentIsPublic })
      });

      if (response.ok) {
        showBanner('success', `Flow ${!currentIsPublic ? 'made public' : 'made private'}`);
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to update flow visibility');
      }
    } catch (error) {
      console.error('Failed to toggle public status:', error);
      showBanner('error', 'Failed to update flow visibility');
    } finally {
      setActionLoading(null);
    }
  };

  const publishFlow = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });

      if (response.ok) {
        showBanner('success', 'Flow published successfully');
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to publish flow');
      }
    } catch (error) {
      console.error('Failed to publish flow:', error);
      showBanner('error', 'Failed to publish flow');
    } finally {
      setActionLoading(null);
    }
  };

  const unpublishFlow = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' })
      });

      if (response.ok) {
        showBanner('success', 'Flow unpublished successfully');
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to unpublish flow');
      }
    } catch (error) {
      console.error('Failed to unpublish flow:', error);
      showBanner('error', 'Failed to unpublish flow');
    } finally {
      setActionLoading(null);
    }
  };

  const archiveFlow = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'archived' })
      });

      if (response.ok) {
        showBanner('success', 'Flow archived successfully');
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to archive flow');
      }
    } catch (error) {
      console.error('Failed to archive flow:', error);
      showBanner('error', 'Failed to archive flow');
    } finally {
      setActionLoading(null);
    }
  };

  const restoreToDraft = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'draft' })
      });

      if (response.ok) {
        showBanner('success', 'Flow restored to draft');
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to restore flow');
      }
    } catch (error) {
      console.error('Failed to restore flow:', error);
      showBanner('error', 'Failed to restore flow');
    } finally {
      setActionLoading(null);
    }
  };

  const publishAsTemplate = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: true })
      });

      if (response.ok) {
        showBanner('success', 'Flow published as template');
        await fetchFlows();
      } else {
        showBanner('error', 'Failed to publish as template');
      }
    } catch (error) {
      console.error('Failed to publish as template:', error);
      showBanner('error', 'Failed to publish as template');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteFlow = async (flowId: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        showBanner('success', 'Flow deleted successfully');
        await fetchFlows();
        setConfirmDeleteId(null);
      } else {
        showBanner('error', 'Failed to delete flow');
      }
    } catch (error) {
      console.error('Failed to delete flow:', error);
      showBanner('error', 'Failed to delete flow');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteClick = (flowId: string) => {
    if (confirmDeleteId === flowId) {
      deleteFlow(flowId);
    } else {
      setConfirmDeleteId(flowId);
      // Clear confirmation after 3 seconds
      setTimeout(() => {
        if (confirmDeleteId === flowId) {
          setConfirmDeleteId(null);
        }
      }, 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <span className="bg-emerald-500/10 text-emerald-400/60 border border-emerald-500/20 rounded-full text-xs font-medium px-2 py-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Published
          </span>
        );
      case 'draft':
        return (
          <span className="bg-yellow-500/10 text-yellow-400/60 border border-yellow-500/20 rounded-full text-xs font-medium px-2 py-1">
            Draft
          </span>
        );
      case 'archived':
        return (
          <span className="bg-gray-500/10 text-gray-400/60 border border-gray-500/20 rounded-full text-xs font-medium px-2 py-1">
            Archived
          </span>
        );
      default:
        return (
          <span className="bg-white/10 text-white/40 border border-white/20 rounded-full text-xs font-medium px-2 py-1">
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

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
                         (flow.description || '').toLowerCase().includes(searchFilter.toLowerCase());
    const matchesStatus = !statusFilter || flow.status === statusFilter;
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
            <h2 className="text-2xl font-bold text-white">Flows Management</h2>
            <p className="text-sm text-white/40 mt-1">Manage flows across all organizations</p>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Search flows..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2.5 bg-white/5 border border-white/10 rounded text-white focus:outline-none focus:border-white/30 transition-colors"
          >
            <option value="">All statuses</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/40">Loading flows...</div>
          </div>
        ) : filteredFlows.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-white/20" />
              </div>
              <p className="text-white/40">No flows found</p>
            </div>
          </div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-white/5 border-b border-white/5">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Title</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Status</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Public</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Template</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Type</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Created</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Updated</th>
                <th className="text-left px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlows.map((flow) => (
                <React.Fragment key={flow.id}>
                  <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      {editingId === flow.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/30"
                            placeholder="Flow title"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="font-medium text-white">{flow.title}</div>
                          {flow.description && (
                            <div className="text-sm text-white/60 truncate max-w-xs">
                              {flow.description}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(flow.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => togglePublic(flow.id, flow.isPublic)}
                        disabled={actionLoading === flow.id}
                        className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
                        title={flow.isPublic ? 'Make private' : 'Make public'}
                      >
                        {flow.isPublic ? (
                          <Eye className="w-4 h-4 text-white/70" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-white/40" />
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      {flow.isTemplate ? (
                        <FileText className="w-4 h-4 text-white/70" />
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-white/60">
                        {flow.workflowType || 'Standard'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {formatDate(flow.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-white/60">
                      {formatDate(flow.updatedAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {editingId === flow.id ? (
                          <>
                            <button
                              onClick={saveEditing}
                              disabled={actionLoading === flow.id}
                              className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors disabled:opacity-50"
                              title="Save changes"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="p-1.5 text-white/40 hover:bg-white/10 rounded transition-colors"
                              title="Cancel editing"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => startEditing(flow)}
                            className="p-1.5 text-white/40 hover:text-white hover:bg-white/10 rounded transition-colors"
                            title="Edit flow"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                        )}

                        {flow.status === 'draft' && (
                          <button
                            onClick={() => publishFlow(flow.id)}
                            disabled={actionLoading === flow.id}
                            className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Publish
                          </button>
                        )}

                        {flow.status === 'published' && (
                          <>
                            <button
                              onClick={() => unpublishFlow(flow.id)}
                              disabled={actionLoading === flow.id}
                              className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              Unpublish
                            </button>
                            <button
                              onClick={() => archiveFlow(flow.id)}
                              disabled={actionLoading === flow.id}
                              className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              <Archive className="w-3 h-3 mr-1" />
                              Archive
                            </button>
                            <button
                              onClick={() => publishAsTemplate(flow.id)}
                              disabled={actionLoading === flow.id}
                              className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              <FileText className="w-3 h-3 mr-1" />
                              Template
                            </button>
                          </>
                        )}

                        {flow.status === 'archived' && (
                          <button
                            onClick={() => restoreToDraft(flow.id)}
                            disabled={actionLoading === flow.id}
                            className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Restore
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteClick(flow.id)}
                          disabled={actionLoading === flow.id}
                          className={`p-1.5 rounded transition-colors disabled:opacity-50 ${
                            confirmDeleteId === flow.id
                              ? 'text-red-400 hover:bg-red-500/20'
                              : 'text-white/40 hover:text-red-400 hover:bg-red-500/10'
                          }`}
                          title={confirmDeleteId === flow.id ? 'Click again to delete' : 'Delete flow'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {editingId === flow.id && (
                    <tr>
                      <td colSpan={8} className="px-6 py-2 border-b border-white/5">
                        <textarea
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Flow description (optional)"
                          rows={3}
                          className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
                        />
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