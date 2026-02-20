"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Edit3, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  EyeOff, 
  FileText,
} from 'lucide-react';
import { DataTable, Badge, useToast, EmptyState } from '@/components/ui';

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

interface FlowsResponse {
  data: {
    flows: Flow[];
    total: number;
  };
}

export const AdminFlowsTab: React.FC = () => {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const { toast } = useToast();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchFlows();
  }, []);



  const fetchFlows = async () => {
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
      
      const response = await fetch(`/api/admin/flows?${params}`);
      if (response.ok) {
        const data: FlowsResponse = await response.json();
        setFlows(data.data.flows || []);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to fetch flows', 'error');
      }
    } catch (error) {
      console.error('Failed to fetch flows:', error);
      toast('Failed to fetch flows', 'error');
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
        toast('Flow updated successfully', 'success');
        await fetchFlows();
        cancelEditing();
      } else {
        toast('Failed to update flow', 'error');
      }
    } catch (error) {
      console.error('Failed to update flow:', error);
      toast('Failed to update flow', 'error');
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
        toast(`Flow ${!currentIsPublic ? 'made public' : 'made private'}`, 'success');
        await fetchFlows();
      } else {
        toast('Failed to update flow visibility', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle public status:', error);
      toast('Failed to update flow visibility', 'error');
    } finally {
      setActionLoading(null);
    }
  };



  const toggleTemplate = async (flowId: string, currentIsTemplate: boolean | null) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTemplate: !currentIsTemplate })
      });

      if (response.ok) {
        toast(`Flow ${!currentIsTemplate ? 'marked as template' : 'unmarked as template'}`, 'success');
        await fetchFlows();
      } else {
        toast('Failed to update template status', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle template status:', error);
      toast('Failed to update template status', 'error');
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (flowId: string, newStatus: string) => {
    try {
      setActionLoading(flowId);
      const response = await fetch(`/api/flows/${flowId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast(`Flow status updated to ${newStatus}`, 'success');
        await fetchFlows();
      } else {
        toast('Failed to update flow status', 'error');
      }
    } catch (error) {
      console.error('Failed to update flow status:', error);
      toast('Failed to update flow status', 'error');
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
        toast('Flow deleted successfully', 'success');
        await fetchFlows();
        setConfirmDeleteId(null);
      } else {
        toast('Failed to delete flow', 'error');
      }
    } catch (error) {
      console.error('Failed to delete flow:', error);
      toast('Failed to delete flow', 'error');
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



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleBulkDelete = async (ids: Set<string>) => {
    try {
      const deletePromises = Array.from(ids).map(id => 
        fetch(`/api/flows/${id}`, { method: 'DELETE' })
      );
      
      await Promise.all(deletePromises);
      toast(`${ids.size} flows deleted successfully`, 'success');
      setSelectedIds(new Set());
      await fetchFlows();
    } catch (error) {
      console.error('Failed to delete flows:', error);
      toast('Failed to delete flows', 'error');
    }
  };

  const handleBulkArchive = async (ids: Set<string>) => {
    try {
      const archivePromises = Array.from(ids).map(id => 
        fetch(`/api/flows/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'archived' })
        })
      );
      
      await Promise.all(archivePromises);
      toast(`${ids.size} flows archived successfully`, 'success');
      setSelectedIds(new Set());
      await fetchFlows();
    } catch (error) {
      console.error('Failed to archive flows:', error);
      toast('Failed to archive flows', 'error');
    }
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
      render: (flow: Flow) => (
        editingId === flow.id ? (
          <div className="space-y-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white focus:outline-none focus:border-white/30"
              placeholder="Flow title"
            />
            <textarea
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              placeholder="Flow description (optional)"
              rows={2}
              className="w-full px-2 py-1 bg-white/5 border border-white/10 rounded text-sm text-white placeholder-white/40 focus:outline-none focus:border-white/30 resize-none"
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
        )
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (flow: Flow) => (
        <div className="flex items-center gap-2">
          <Badge variant={flow.status === 'published' ? 'success' : flow.status === 'draft' ? 'warning' : 'default'}>
            {flow.status}
          </Badge>
          <select
            value={flow.status}
            onChange={(e) => updateStatus(flow.id, e.target.value)}
            disabled={actionLoading === flow.id}
            className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-white focus:outline-none focus:border-white/30 disabled:opacity-50"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      ),
    },
    {
      key: 'workflowType',
      label: 'Type',
      render: (flow: Flow) => (
        <span className="text-sm text-white/60">
          {flow.workflowType || 'Standard'}
        </span>
      ),
    },
    {
      key: 'isTemplate',
      label: 'Template',
      render: (flow: Flow) => (
        <button
          onClick={() => toggleTemplate(flow.id, flow.isTemplate)}
          disabled={actionLoading === flow.id}
          className="p-1 rounded hover:bg-white/10 transition-colors disabled:opacity-50"
          title={flow.isTemplate ? 'Remove from templates' : 'Mark as template'}
        >
          {flow.isTemplate ? (
            <FileText className="w-4 h-4 text-white/70" />
          ) : (
            <span className="text-white/20">—</span>
          )}
        </button>
      ),
    },
    {
      key: 'isPublic',
      label: 'Public',
      render: (flow: Flow) => (
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
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (_flow: Flow) => (
        <span className="text-white/20">—</span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (flow: Flow) => (
        <span className="text-sm text-white/60">
          {formatDate(flow.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (flow: Flow) => (
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
      ),
    },
  ];

  const bulkActions = [
    {
      label: 'Delete Selected',
      onClick: handleBulkDelete,
      variant: 'danger' as const,
    },
    {
      label: 'Archive Selected',
      onClick: handleBulkArchive,
      variant: 'default' as const,
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
            <h2 className="text-2xl font-bold text-white">Flows Management</h2>
            <p className="text-sm text-white/40 mt-1">Manage flows across all organizations</p>
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
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DataTable
          columns={columns}
          data={flows}
          totalCount={totalCount}
          isLoading={loading}
          searchable
          searchPlaceholder="Search flows by title..."
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
          getRowId={(flow) => flow.id}
          bulkActions={bulkActions}
          exportable
          exportFilename="flows"
          emptyState={
            <EmptyState
              title="No flows found"
              description="No flows match your search criteria"
            />
          }
        />
      </div>
    </motion.div>
  );
};