"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Building2 } from 'lucide-react';
import { DataTable, Modal, ConfirmDialog, Badge, EmptyState, useToast } from '@/components/ui';

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  createdAt: string;
}

interface OrganizationsResponse {
  data: {
    organizations: Organization[];
    total: number;
  };
}

interface CreateOrganizationData {
  name: string;
  slug: string;
  domain?: string;
}

interface UpdateOrganizationData {
  name?: string;
  domain?: string;
}

export const AdminOrganizationsTab: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Organization | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateOrganizationData>({
    name: '',
    slug: '',
    domain: ''
  });
  const [editForm, setEditForm] = useState<UpdateOrganizationData>({
    name: '',
    domain: ''
  });
  
  const { toast } = useToast();

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const loadOrganizations = async () => {
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

      const response = await fetch(`/api/admin/organizations?${params}`);
      if (response.ok) {
        const data: OrganizationsResponse = await response.json();
        setOrganizations(data.data.organizations);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load organizations', 'error');
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      toast('Failed to load organizations', 'error');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadOrganizations();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

  const handleCreateOrganization = async () => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          domain: createForm.domain || undefined
        }),
      });

      if (response.ok) {
        toast('Organization created successfully', 'success');
        setShowCreateModal(false);
        setCreateForm({ name: '', slug: '', domain: '' });
        loadOrganizations();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to create organization', 'error');
      }
    } catch (error) {
      console.error('Failed to create organization:', error);
      toast('Failed to create organization', 'error');
    }
  };

  const handleEditOrganization = async () => {
    if (!editingOrg) return;

    try {
      const response = await fetch(`/api/admin/organizations/${editingOrg.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          domain: editForm.domain || undefined
        }),
      });

      if (response.ok) {
        toast('Organization updated successfully', 'success');
        setShowEditModal(false);
        setEditingOrg(null);
        setEditForm({ name: '', domain: '' });
        loadOrganizations();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to update organization', 'error');
      }
    } catch (error) {
      console.error('Failed to update organization:', error);
      toast('Failed to update organization', 'error');
    }
  };

  const handleDeleteOrganization = async (org: Organization) => {
    try {
      const response = await fetch(`/api/admin/organizations/${org.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast('Organization deleted successfully', 'success');
        setConfirmDelete(null);
        loadOrganizations();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to delete organization', 'error');
      }
    } catch (error) {
      console.error('Failed to delete organization:', error);
      toast('Failed to delete organization', 'error');
    }
  };

  const openEditModal = (org: Organization) => {
    setEditingOrg(org);
    setEditForm({
      name: org.name,
      domain: org.domain || ''
    });
    setShowEditModal(true);
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (org: Organization) => (
        <div className="font-medium text-white">{org.name}</div>
      )
    },
    {
      key: 'slug',
      label: 'Slug',
      sortable: true,
      render: (org: Organization) => (
        <div className="font-mono text-sm text-white/70">{org.slug}</div>
      )
    },
    {
      key: 'domain',
      label: 'Domain',
      render: (org: Organization) => (
        org.domain ? (
          <Badge variant="info">
            {org.domain}
          </Badge>
        ) : (
          <span className="text-white/40">—</span>
        )
      )
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (org: Organization) => (
        <div className="text-sm text-white/60">
          {new Date(org.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (org: Organization) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(org)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Edit organization"
          >
            <Edit className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={() => setConfirmDelete(org)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Delete organization"
          >
            <Trash2 className="w-4 h-4 text-white/60" />
          </button>
        </div>
      )
    }
  ];

  const emptyState = (
    <EmptyState
      icon={<Building2 className="w-12 h-12" />}
      title="No organizations found"
      description={searchQuery ? "No organizations match your search criteria." : "Get started by creating your first organization."}
      action={{
        label: "Create Organization",
        onClick: () => setShowCreateModal(true)
      }}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Organizations</h3>
          <p className="text-sm text-white/60">Manage all organizations in the system</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Organization
        </button>
      </div>

      <DataTable
        columns={columns}
        data={organizations}
        totalCount={totalCount}
        isLoading={loading}
        searchable
        searchPlaceholder="Search organizations..."
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
        exportFilename="organizations"
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({ name: '', slug: '', domain: '' });
        }}
        title="Create Organization"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Name *
            </label>
            <input
              type="text"
              value={createForm.name}
              onChange={(e) => {
                const name = e.target.value;
                setCreateForm({
                  ...createForm,
                  name,
                  slug: generateSlug(name)
                });
              }}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Slug *
            </label>
            <input
              type="text"
              value={createForm.slug}
              onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none font-mono text-sm"
              placeholder="organization-slug"
            />
            <p className="text-xs text-white/40 mt-1">
              URL-friendly identifier (lowercase, hyphens only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={createForm.domain}
              onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="example.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({ name: '', slug: '', domain: '' });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateOrganization}
              disabled={!createForm.name || !createForm.slug}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Organization
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingOrg(null);
          setEditForm({ name: '', domain: '' });
        }}
        title="Edit Organization"
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
              placeholder="Enter organization name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Slug
            </label>
            <input
              type="text"
              value={editingOrg?.slug || ''}
              disabled
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white/40 font-mono text-sm cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">
              Slug cannot be changed after creation
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Domain
            </label>
            <input
              type="text"
              value={editForm.domain}
              onChange={(e) => setEditForm({ ...editForm, domain: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
              placeholder="example.com"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingOrg(null);
                setEditForm({ name: '', domain: '' });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditOrganization}
              disabled={!editForm.name}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Organization
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => confirmDelete ? handleDeleteOrganization(confirmDelete) : Promise.resolve()}
        title="Delete Organization"
        description={`Are you sure you want to delete "${confirmDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
};