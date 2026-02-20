"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server,
  Plus,
  Globe,
  Loader2,
  X,
  Info,
  Activity
} from 'lucide-react';
import { DataTable, useToast, EmptyState } from '@/components/ui';

interface NodeApiConfig {
  id: string;
  endpointUrl: string;
  label: string | null;
  isActive: boolean;
  lastHealthAt: string | null;
  createdAt: string;
}

interface NodeApiResponse {
  data: {
    configs: NodeApiConfig[];
    total: number;
  };
}

export const AdminNodeApiTab: React.FC = () => {
  const [configs, setConfigs] = useState<NodeApiConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('label');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [showForm, setShowForm] = useState(false);
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      const response = await fetch(`/api/admin/node-api?${params}`);
      if (!response.ok) throw new Error('Failed to fetch node configurations');
      
      const data: NodeApiResponse = await response.json();
      setConfigs(data.data?.configs || []);
      setTotalCount(data.data?.total || 0);
    } catch (error) {
      console.error('Failed to load node configurations:', error);
      toast('Failed to load node configurations', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formEndpoint.trim()) {
      toast('Endpoint URL is required', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const response = await fetch('/api/node-api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpointUrl: formEndpoint.trim(),
          label: formLabel.trim() || undefined,
          apiKey: formApiKey.trim() || undefined
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create node configuration');
      }

      const data = await response.json();
      setConfigs(prev => [...prev, data.data.config]);
      
      setFormEndpoint('');
      setFormLabel('');
      setFormApiKey('');
      setShowForm(false);
      
      toast('Node API endpoint added successfully', 'success');
    } catch (error) {
      console.error('Failed to create node configuration:', error);
      toast(error instanceof Error ? error.message : 'Failed to create node configuration', 'error');
    } finally {
      setSubmitting(false);
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

  const toggleActive = async (configId: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/node-api/${configId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentActive })
      });

      if (response.ok) {
        toast(`Configuration ${!currentActive ? 'activated' : 'deactivated'}`, 'success');
        await loadConfigs();
      } else {
        toast('Failed to update configuration', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle configuration:', error);
      toast('Failed to update configuration', 'error');
    }
  };

  const triggerHealthCheck = async (configId: string) => {
    try {
      const response = await fetch(`/api/admin/node-api/${configId}/health`, {
        method: 'POST'
      });

      if (response.ok) {
        toast('Health check triggered', 'success');
        await loadConfigs();
      } else {
        toast('Failed to trigger health check', 'error');
      }
    } catch (error) {
      console.error('Failed to trigger health check:', error);
      toast('Failed to trigger health check', 'error');
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadConfigs();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

  const columns = [
    {
      key: 'label',
      label: 'Label',
      sortable: true,
      render: (config: NodeApiConfig) => (
        <div className="flex items-center gap-3">
          <Globe className="w-5 h-5 text-white/70" />
          <span className="text-white font-medium">
            {config.label || 'Unnamed Endpoint'}
          </span>
        </div>
      ),
    },
    {
      key: 'endpointUrl',
      label: 'Endpoint URL',
      render: (config: NodeApiConfig) => (
        <code className="text-sm text-white/80 bg-white/5 px-2 py-1 rounded font-mono truncate max-w-xs block">
          {config.endpointUrl}
        </code>
      ),
    },
    {
      key: 'isActive',
      label: 'Active',
      render: (config: NodeApiConfig) => (
        <button
          onClick={() => toggleActive(config.id, config.isActive)}
          className="flex items-center gap-2 p-1 rounded hover:bg-white/10 transition-colors"
          title={config.isActive ? 'Deactivate' : 'Activate'}
        >
          <span 
            className={`w-2 h-2 rounded-full ${
              config.isActive ? 'bg-green-500' : 'bg-red-500'
            }`} 
          />
          <span className="text-xs text-white/60">
            {config.isActive ? 'Active' : 'Inactive'}
          </span>
        </button>
      ),
    },
    {
      key: 'lastHealthAt',
      label: 'Last Health Check',
      render: (config: NodeApiConfig) => (
        <span className="text-sm text-white/60">
          {formatDate(config.lastHealthAt)}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (config: NodeApiConfig) => (
        <span className="text-sm text-white/60">
          {formatDate(config.createdAt)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (config: NodeApiConfig) => (
        <button
          onClick={() => triggerHealthCheck(config.id)}
          className="px-3 py-1.5 border border-white/20 hover:border-white/40 text-white rounded text-sm font-medium transition-colors inline-flex items-center gap-2"
        >
          <Activity className="w-3 h-3" />
          Health Check
        </button>
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
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 border border-white/20 rounded">
              <Server className="w-6 h-6 text-white/70" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Canton Node API Endpoints</h2>
              <p className="text-white/60 text-sm mt-1">Configure connections to Canton Node APIs</p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors"
          >
            {showForm ? (
              <>
                <X className="w-4 h-4" />
                Cancel
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Add Endpoint
              </>
            )}
          </button>
        </div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-6 mb-6"
            >
              <h3 className="text-lg font-bold text-white mb-4">Add New Node API Endpoint</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Endpoint URL <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="url"
                    value={formEndpoint}
                    onChange={(e) => setFormEndpoint(e.target.value)}
                    placeholder="https://canton-node.example.com/api"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Label (Optional)
                  </label>
                  <input
                    type="text"
                    value={formLabel}
                    onChange={(e) => setFormLabel(e.target.value)}
                    placeholder="Production Node"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    API Key (Optional)
                  </label>
                  <input
                    type="password"
                    value={formApiKey}
                    onChange={(e) => setFormApiKey(e.target.value)}
                    placeholder="Enter API key"
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white placeholder-white/40 focus:outline-none focus:border-white/30"
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !formEndpoint.trim()}
                    className="flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Add Endpoint
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 text-white/60 hover:text-white border border-white/10 rounded hover:bg-white/5 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <DataTable
          columns={columns}
          data={configs}
          totalCount={totalCount}
          isLoading={loading}
          searchable
          searchPlaceholder="Search by label or endpoint..."
          onSearch={handleSearch}
          sortBy={sortBy}
          sortDir={sortDir}
          onSort={handleSort}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          exportable
          exportFilename="node-api-configs"
          getRowId={(config) => config.id}
          emptyState={
            <EmptyState
              title="No Canton Node API endpoints configured"
              description="Add your first Canton Node API endpoint to get started"
            />
          }
        />
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="bg-white/10 border border-white/20 rounded p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-white/70 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-white/80 text-sm font-medium mb-1">Configuration Notice</p>
              <p className="text-white/60 text-sm">
                Node API configurations cannot be modified after creation. Contact support to update or remove endpoints.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};