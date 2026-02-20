"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { File, Globe, Lock } from 'lucide-react';

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
  data: Flow[];
}

export const AdminTemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<Flow[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/flows?limit=50');
      if (response.ok) {
        const data: FlowsResponse = await response.json();
        const templateFlows = data.data.filter(flow => flow.isTemplate === true);
        setTemplates(templateFlows);
      } else {
        showBanner('error', 'Failed to load templates');
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      showBanner('error', 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  const getStatusBadgeClasses = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-emerald-500/10 text-emerald-400/60 border-emerald-500/20';
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-400/60 border-yellow-500/20';
      case 'archived':
        return 'bg-red-500/10 text-red-400/60 border-red-500/20';
      default:
        return 'bg-white/10 text-white/60 border-white/20';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
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

      <div className="bg-black/20 border border-white/5 rounded flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Flow Templates</h2>
          <p className="text-sm text-white/40 mt-1">Browse and manage reusable workflow templates</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-white/40">Loading templates...</div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <File className="w-12 h-12 text-white/20 mb-4" />
              <div className="text-white/40 mb-2">No templates yet</div>
              <div className="text-white/20 text-sm">Mark a flow as template from the Flows tab.</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {templates.map(template => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 border border-white/5 rounded p-6 hover:bg-white/10 hover:border-white/10 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-2">{template.title}</h3>
                      {template.description && (
                        <p className="text-white/60 text-sm line-clamp-2 mb-4">{template.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {template.isPublic && (
                        <div
                          className="p-1.5 bg-white/10 border border-white/20 rounded"
                          title="Public template"
                        >
                          <Globe className="w-4 h-4 text-white/70" />
                        </div>
                      )}
                      {template.isPublic === false && (
                        <div
                          className="p-1.5 bg-white/10 border border-white/20 rounded"
                          title="Private template"
                        >
                          <Lock className="w-4 h-4 text-white/70" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 border rounded-full text-xs font-medium ${getStatusBadgeClasses(template.status)}`}>
                        {template.status}
                      </span>
                      {template.workflowType && (
                        <span className="px-2 py-1 bg-white/10 text-white/60 border border-white/20 rounded-full text-xs font-medium">
                          {template.workflowType}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-white/40">
                      {formatDate(template.updatedAt)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};