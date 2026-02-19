"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server,
  Plus,
  Globe,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Info
} from 'lucide-react';

interface NodeApiConfig {
  id: string;
  endpointUrl: string;
  label: string | null;
  isActive: boolean;
  lastHealthAt: string | null;
  createdAt: string;
}

interface Banner {
  type: 'success' | 'error';
  message: string;
}

export const AdminNodeApiTab: React.FC = () => {
  const [configs, setConfigs] = useState<NodeApiConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formEndpoint, setFormEndpoint] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formApiKey, setFormApiKey] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<Banner | null>(null);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/node-api');
      if (!response.ok) throw new Error('Failed to fetch node configurations');
      
      const data = await response.json();
      setConfigs(data.data?.configs || []);
    } catch (error) {
      console.error('Failed to load node configurations:', error);
      showBanner('error', 'Failed to load node configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formEndpoint.trim()) {
      showBanner('error', 'Endpoint URL is required');
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
      
      showBanner('success', 'Node API endpoint added successfully');
    } catch (error) {
      console.error('Failed to create node configuration:', error);
      showBanner('error', error instanceof Error ? error.message : 'Failed to create node configuration');
    } finally {
      setSubmitting(false);
    }
  };

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
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

  useEffect(() => {
    loadConfigs();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <AnimatePresence>
        {banner && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-lg border ${
              banner.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-400' 
                : 'bg-red-500/20 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-2">
              {banner.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              {banner.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <Server className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Canton Node API Endpoints</h2>
            <p className="text-white/60 text-sm mt-1">Configure connections to Canton Node APIs</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
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
            className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-6"
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !formEndpoint.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="px-4 py-2 text-white/60 hover:text-white border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-400" />
          <p className="text-white/60">Loading node configurations...</p>
        </div>
      )}

      {!loading && configs.length === 0 && (
        <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-8 text-center">
          <Server className="w-12 h-12 mx-auto mb-3 text-white/20" />
          <h3 className="text-lg font-medium text-white mb-2">No Canton Node API endpoints configured</h3>
          <p className="text-white/60">
            Add your first Canton Node API endpoint to get started.
          </p>
        </div>
      )}

      {!loading && configs.length > 0 && (
        <div className="space-y-4">
          {configs.map(config => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-6 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    <h3 className="text-lg font-bold text-white">
                      {config.label || 'Unnamed Endpoint'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span 
                        className={`w-2 h-2 rounded-full ${
                          config.isActive ? 'bg-green-500' : 'bg-red-500'
                        }`} 
                      />
                      <span className="text-xs text-white/60">
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <code className="text-sm text-white/80 bg-white/5 px-2 py-1 rounded font-mono">
                    {config.endpointUrl}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-white/40">Last Health Check:</span>
                  <div className="text-white/70 mt-1">{formatDate(config.lastHealthAt)}</div>
                </div>
                <div>
                  <span className="text-white/40">Created:</span>
                  <div className="text-white/70 mt-1">{formatDate(config.createdAt)}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-300 text-sm font-medium mb-1">Configuration Notice</p>
            <p className="text-blue-200/80 text-sm">
              Node API configurations cannot be modified after creation. Contact support to update or remove endpoints.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};