"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Globe, Lock, Star } from 'lucide-react';
import { DataTable, useToast, EmptyState } from '@/components/ui';

interface Template {
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
  featured?: boolean;
}

interface TemplatesResponse {
  data: {
    templates: Template[];
    total: number;
  };
}

export const AdminTemplatesTab: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { toast } = useToast();

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      const response = await fetch(`/api/admin/templates?${params}`);
      if (response.ok) {
        const data: TemplatesResponse = await response.json();
        setTemplates(data.data.templates || []);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load templates', 'error');
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast('Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadTemplates();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

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

  const togglePublic = async (templateId: string, currentIsPublic: boolean | null) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublic: !currentIsPublic })
      });

      if (response.ok) {
        toast(`Template ${!currentIsPublic ? 'made public' : 'made private'}`, 'success');
        await loadTemplates();
      } else {
        toast('Failed to update template visibility', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle public status:', error);
      toast('Failed to update template visibility', 'error');
    }
  };

  const toggleFeatured = async (templateId: string, currentFeatured: boolean) => {
    try {
      const response = await fetch(`/api/admin/templates/${templateId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ featured: !currentFeatured })
      });

      if (response.ok) {
        toast(`Template ${!currentFeatured ? 'featured' : 'unfeatured'}`, 'success');
        await loadTemplates();
      } else {
        toast('Failed to update template featured status', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle featured status:', error);
      toast('Failed to update template featured status', 'error');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const columns = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (template: Template) => (
        <div>
          <div className="font-medium text-white">{template.title}</div>
          {template.description && (
            <div className="text-sm text-white/60 truncate max-w-xs">
              {template.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (template: Template) => (
        <div className="text-sm text-white/60 max-w-xs truncate">
          {template.description || (
            <span className="text-white/40 italic">No description</span>
          )}
        </div>
      ),
    },
    {
      key: 'workflowType',
      label: 'Type',
      render: (template: Template) => (
        <span className="text-sm text-white/60">
          {template.workflowType || 'Standard'}
        </span>
      ),
    },
    {
      key: 'isPublic',
      label: 'Public',
      render: (template: Template) => (
        <button
          onClick={() => togglePublic(template.id, template.isPublic)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title={template.isPublic ? 'Make private' : 'Make public'}
        >
          {template.isPublic ? (
            <Globe className="w-4 h-4 text-white/70" />
          ) : (
            <Lock className="w-4 h-4 text-white/40" />
          )}
        </button>
      ),
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (template: Template) => (
        <button
          onClick={() => toggleFeatured(template.id, template.featured || false)}
          className="p-1 rounded hover:bg-white/10 transition-colors"
          title={template.featured ? 'Remove from featured' : 'Mark as featured'}
        >
          {template.featured ? (
            <Star className="w-4 h-4 text-yellow-400" />
          ) : (
            <Star className="w-4 h-4 text-white/40" />
          )}
        </button>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (template: Template) => (
        <span className="text-sm text-white/60">
          {formatDate(template.createdAt)}
        </span>
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
      <div className="bg-black/20 border border-white/5 rounded flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-lg font-bold text-white">Flow Templates</h2>
          <p className="text-sm text-white/40 mt-1">Browse and manage reusable workflow templates</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <DataTable
            columns={columns}
            data={templates}
            totalCount={totalCount}
            isLoading={loading}
            searchable
            searchPlaceholder="Search templates by title..."
            onSearch={handleSearch}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            exportable
            exportFilename="templates"
            getRowId={(template) => template.id}
            emptyState={
              <EmptyState
                title="No templates yet"
                description="Mark a flow as template from the Flows tab"
              />
            }
          />
        </div>
      </div>
    </motion.div>
  );
};