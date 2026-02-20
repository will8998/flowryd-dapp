"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Store, ExternalLink } from 'lucide-react';
import { DataTable, Modal, ConfirmDialog, Badge, EmptyState, useToast } from '@/components/ui';

interface Provider {
  id: string;
  name: string;
  category: 'strategy' | 'development' | 'creative';
  description?: string;
  website?: string;
  contactEmail?: string;
  logoUrl?: string;
  status: 'pending' | 'active' | 'inactive';
  createdAt: string;
}

interface ProvidersResponse {
  data: {
    providers: Provider[];
    total: number;
  };
}

interface CreateProviderData {
  name: string;
  category: 'strategy' | 'development' | 'creative';
  description?: string;
  website?: string;
  contactEmail?: string;
  logoUrl?: string;
  status: 'pending' | 'active' | 'inactive';
}

interface UpdateProviderData {
  name?: string;
  category?: 'strategy' | 'development' | 'creative';
  description?: string;
  website?: string;
  contactEmail?: string;
  logoUrl?: string;
  status?: 'pending' | 'active' | 'inactive';
}

export const AdminProvidersTab: React.FC = () => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Provider | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateProviderData>({
    name: '',
    category: 'development',
    description: '',
    website: '',
    contactEmail: '',
    logoUrl: '',
    status: 'active'
  });
  const [editForm, setEditForm] = useState<UpdateProviderData>({
    name: '',
    category: 'development',
    description: '',
    website: '',
    contactEmail: '',
    logoUrl: '',
    status: 'active'
  });
  
  const { toast } = useToast();

  const loadProviders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        sortBy,
        sortDir,
      });
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/admin/providers?${params}`);
      if (response.ok) {
        const data: ProvidersResponse = await response.json();
        setProviders(data.data.providers);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load providers', 'error');
      }
    } catch (error) {
      console.error('Failed to load providers:', error);
      toast('Failed to load providers', 'error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadProviders();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

  const handleCreateProvider = async () => {
    try {
      const response = await fetch('/api/admin/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          description: createForm.description || undefined,
          website: createForm.website || undefined,
          contactEmail: createForm.contactEmail || undefined,
          logoUrl: createForm.logoUrl || undefined
        }),
      });

      if (response.ok) {
        toast('Provider created successfully', 'success');
        setShowCreateModal(false);
        setCreateForm({
          name: '',
          category: 'development',
          description: '',
          website: '',
          contactEmail: '',
          logoUrl: '',
          status: 'active'
        });
        loadProviders();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to create provider', 'error');
      }
    } catch (error) {
      console.error('Failed to create provider:', error);
      toast('Failed to create provider', 'error');
    }
  };

  const handleEditProvider = async () => {
    if (!editingProvider) return;

    try {
      const response = await fetch(`/api/admin/providers/${editingProvider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          description: editForm.description || undefined,
          website: editForm.website || undefined,
          contactEmail: editForm.contactEmail || undefined,
          logoUrl: editForm.logoUrl || undefined
        }),
      });

      if (response.ok) {
        toast('Provider updated successfully', 'success');
        setShowEditModal(false);
        setEditingProvider(null);
        setEditForm({
          name: '',
          category: 'development',
          description: '',
          website: '',
          contactEmail: '',
          logoUrl: '',
          status: 'active'
        });
        loadProviders();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to update provider', 'error');
      }
    } catch (error) {
      console.error('Failed to update provider:', error);
      toast('Failed to update provider', 'error');
    }
  };

  const handleDeleteProvider = async (provider: Provider) => {
    try {
      const response = await fetch(`/api/admin/providers/${provider.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast('Provider deleted successfully', 'success');
        setConfirmDelete(null);
        loadProviders();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to delete provider', 'error');
      }
    } catch (error) {
      console.error('Failed to delete provider:', error);
      toast('Failed to delete provider', 'error');
    }
  };

  const openEditModal = (provider: Provider) => {
    setEditingProvider(provider);
    setEditForm({
      name: provider.name,
      category: provider.category,
      description: provider.description || '',
      website: provider.website || '',
      contactEmail: provider.contactEmail || '',
      logoUrl: provider.logoUrl || '',
      status: provider.status
    });
    setShowEditModal(true);
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'strategy': return 'info';
      case 'development': return 'success';
      case 'creative': return 'warning';
      default: return 'default';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (provider: Provider) => (
        <div className="font-medium text-white">{provider.name}</div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (provider: Provider) => (
        <Badge variant={getCategoryBadgeVariant(provider.category)}>
          {provider.category}
        </Badge>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (provider: Provider) => (
        <Badge variant={getStatusBadgeVariant(provider.status)}>
          {provider.status}
        </Badge>
      )
    },
    {
      key: 'website',
      label: 'Website',
      render: (provider: Provider) => (
        provider.website ? (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-white/70 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="text-sm">Visit</span>
          </a>
        ) : (
          <span className="text-white/40">—</span>
        )
      )
    },
    {
      key: 'contactEmail',
      label: 'Contact Email',
      render: (provider: Provider) => (
        provider.contactEmail ? (
          <div className="text-sm text-white/70">{provider.contactEmail}</div>
        ) : (
          <span className="text-white/40">—</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (provider: Provider) => (
        <div className="text-sm text-white/60">
          {new Date(provider.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (provider: Provider) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(provider)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Edit provider"
          >
            <Edit className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => setConfirmDelete(provider)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Delete provider"
          >
            <Trash2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      )
    }
  ];

  const emptyState = (
    <EmptyState
      icon={<Store className="w-12 h-12" />}
      title="No providers found"
      description={searchQuery ? "No providers match your search criteria." : "Get started by creating your first provider."}
      action={{
        label: "Create Provider",
        onClick: () => setShowCreateModal(true)
      }}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Providers</h3>
          <p className="text-sm text-white/60">Manage service providers</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Provider
        </button>
      </div>

      <DataTable
        columns={columns}
        data={providers}
        totalCount={totalCount}
        isLoading={loading}
        searchable
        searchPlaceholder="Search providers..."
        onSearch={setSearchQuery}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={(column) => {
          if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(column);
            setSortDir('asc');
          }
        }}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyState={emptyState}
        exportable
        exportFilename="providers"
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({
            name: '',
            category: 'development',
            description: '',
            website: '',
            contactEmail: '',
            logoUrl: '',
            status: 'active'
          });
        }}
        title="Create Provider"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="Enter provider name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category *
            </label>
            <select
              value={createForm.category}
              onChange={(e) => setCreateForm({ ...createForm, category: e.target.value as 'strategy' | 'development' | 'creative' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="strategy" className="bg-black text-white">Strategy</option>
              <option value="development" className="bg-black text-white">Development</option>
              <option value="creative" className="bg-black text-white">Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              value={createForm.description}
              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none resize-none"
              placeholder="Enter provider description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Website
            </label>
            <input
              type="url"
              value={createForm.website}
              onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={createForm.contactEmail}
              onChange={(e) => setCreateForm({ ...createForm, contactEmail: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={createForm.logoUrl}
              onChange={(e) => setCreateForm({ ...createForm, logoUrl: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Status *
            </label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as 'pending' | 'active' | 'inactive' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="active" className="bg-black text-white">Active</option>
              <option value="pending" className="bg-black text-white">Pending</option>
              <option value="inactive" className="bg-black text-white">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({
                  name: '',
                  category: 'development',
                  description: '',
                  website: '',
                  contactEmail: '',
                  logoUrl: '',
                  status: 'active'
                });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateProvider}
              disabled={!createForm.name}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Provider
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingProvider(null);
          setEditForm({
            name: '',
            category: 'development',
            description: '',
            website: '',
            contactEmail: '',
            logoUrl: '',
            status: 'active'
          });
        }}
        title="Edit Provider"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="Enter provider name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Category *
            </label>
            <select
              value={editForm.category}
              onChange={(e) => setEditForm({ ...editForm, category: e.target.value as 'strategy' | 'development' | 'creative' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="strategy" className="bg-black text-white">Strategy</option>
              <option value="development" className="bg-black text-white">Development</option>
              <option value="creative" className="bg-black text-white">Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description
            </label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none resize-none"
              placeholder="Enter provider description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Website
            </label>
            <input
              type="url"
              value={editForm.website}
              onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="https://example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Contact Email
            </label>
            <input
              type="email"
              value={editForm.contactEmail}
              onChange={(e) => setEditForm({ ...editForm, contactEmail: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="contact@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Logo URL
            </label>
            <input
              type="url"
              value={editForm.logoUrl}
              onChange={(e) => setEditForm({ ...editForm, logoUrl: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Status *
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'active' | 'inactive' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="active" className="bg-black text-white">Active</option>
              <option value="pending" className="bg-black text-white">Pending</option>
              <option value="inactive" className="bg-black text-white">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingProvider(null);
                setEditForm({
                  name: '',
                  category: 'development',
                  description: '',
                  website: '',
                  contactEmail: '',
                  logoUrl: '',
                  status: 'active'
                });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditProvider}
              disabled={!editForm.name}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Provider
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete ? handleDeleteProvider(confirmDelete) : Promise.resolve()}
        title="Delete Provider"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};