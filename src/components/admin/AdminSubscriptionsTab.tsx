"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Edit, CreditCard } from 'lucide-react';
import { DataTable, Modal, Badge, EmptyState, useToast } from '@/components/ui';

interface Organization {
  id: string;
  name: string;
}

interface Plan {
  id: string;
  name: string;
  tier: 'discover' | 'navigate' | 'activate';
}

interface Subscription {
  id: string;
  orgId: string;
  planId: string;
  status: 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
  createdAt: string;
  organization: Organization;
  plan: Plan;
}

interface SubscriptionsResponse {
  data: {
    subscriptions: Subscription[];
    total: number;
  };
}

interface OrganizationsResponse {
  data: {
    organizations: Organization[];
    total: number;
  };
}

interface PlansResponse {
  data: {
    plans: Plan[];
    total: number;
  };
}

interface CreateSubscriptionData {
  orgId: string;
  planId: string;
  status: 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
}

interface UpdateSubscriptionData {
  planId?: string;
  status?: 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired';
  currentPeriodStart?: string;
  currentPeriodEnd?: string;
  trialEndsAt?: string;
}

export const AdminSubscriptionsTab: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  
  const [createForm, setCreateForm] = useState<CreateSubscriptionData>({
    orgId: '',
    planId: '',
    status: 'pending',
    currentPeriodStart: '',
    currentPeriodEnd: '',
    trialEndsAt: ''
  });
  const [editForm, setEditForm] = useState<UpdateSubscriptionData>({
    planId: '',
    status: 'pending',
    currentPeriodStart: '',
    currentPeriodEnd: '',
    trialEndsAt: ''
  });
  
  const { toast } = useToast();

  const loadSubscriptions = async () => {
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

      const response = await fetch(`/api/admin/subscriptions?${params}`);
      if (response.ok) {
        const data: SubscriptionsResponse = await response.json();
        setSubscriptions(data.data.subscriptions);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load subscriptions', 'error');
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error);
      toast('Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/admin/organizations?limit=1000');
      if (response.ok) {
        const data: OrganizationsResponse = await response.json();
        setOrganizations(data.data.organizations);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
    }
  };

  const loadPlans = async () => {
    try {
      const response = await fetch('/api/admin/plans?limit=1000');
      if (response.ok) {
        const data: PlansResponse = await response.json();
        setPlans(data.data.plans);
      }
    } catch (error) {
      console.error('Failed to load plans:', error);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadSubscriptions();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

  useEffect(() => {
    loadOrganizations();
    loadPlans();
  }, []);

  const handleCreateSubscription = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createForm,
          currentPeriodStart: createForm.currentPeriodStart || undefined,
          currentPeriodEnd: createForm.currentPeriodEnd || undefined,
          trialEndsAt: createForm.trialEndsAt || undefined
        }),
      });

      if (response.ok) {
        toast('Subscription created successfully', 'success');
        setShowCreateModal(false);
        setCreateForm({
          orgId: '',
          planId: '',
          status: 'pending',
          currentPeriodStart: '',
          currentPeriodEnd: '',
          trialEndsAt: ''
        });
        loadSubscriptions();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to create subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to create subscription:', error);
      toast('Failed to create subscription', 'error');
    }
  };

  const handleEditSubscription = async () => {
    if (!editingSubscription) return;

    try {
      const response = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSubscription.id,
          ...editForm,
          currentPeriodStart: editForm.currentPeriodStart || undefined,
          currentPeriodEnd: editForm.currentPeriodEnd || undefined,
          trialEndsAt: editForm.trialEndsAt || undefined
        }),
      });

      if (response.ok) {
        toast('Subscription updated successfully', 'success');
        setShowEditModal(false);
        setEditingSubscription(null);
        setEditForm({
          planId: '',
          status: 'pending',
          currentPeriodStart: '',
          currentPeriodEnd: '',
          trialEndsAt: ''
        });
        loadSubscriptions();
      } else {
        const error = await response.json();
        toast(error.message || 'Failed to update subscription', 'error');
      }
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast('Failed to update subscription', 'error');
    }
  };

  const openEditModal = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setEditForm({
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart ? subscription.currentPeriodStart.split('T')[0] : '',
      currentPeriodEnd: subscription.currentPeriodEnd ? subscription.currentPeriodEnd.split('T')[0] : '',
      trialEndsAt: subscription.trialEndsAt ? subscription.trialEndsAt.split('T')[0] : ''
    });
    setShowEditModal(true);
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'past_due': return 'danger';
      case 'cancelled': return 'default';
      case 'expired': return 'default';
      default: return 'warning';
    }
  };

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case 'activate': return 'success';
      case 'navigate': return 'info';
      case 'discover': return 'warning';
      default: return 'default';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const columns = [
    {
      key: 'organization',
      label: 'Organization',
      sortable: true,
      render: (subscription: Subscription) => (
        <div className="font-medium text-white">{subscription.organization.name}</div>
      )
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <span className="text-white">{subscription.plan.name}</span>
          <Badge variant={getTierBadgeVariant(subscription.plan.tier)}>
            {subscription.plan.tier}
          </Badge>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (subscription: Subscription) => (
        <Badge variant={getStatusBadgeVariant(subscription.status)}>
          {subscription.status.replace('_', ' ')}
        </Badge>
      )
    },
    {
      key: 'period',
      label: 'Period',
      render: (subscription: Subscription) => (
        <div className="text-sm text-white/70">
          {subscription.currentPeriodStart && subscription.currentPeriodEnd ? (
            <div>
              <div>{formatDate(subscription.currentPeriodStart)}</div>
              <div className="text-white/50">to {formatDate(subscription.currentPeriodEnd)}</div>
            </div>
          ) : (
            <span className="text-white/40">—</span>
          )}
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (subscription: Subscription) => (
        <div className="text-sm text-white/60">
          {new Date(subscription.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (subscription: Subscription) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(subscription)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
            title="Edit subscription"
          >
            <Edit className="w-4 h-4 text-white/60" />
          </button>
        </div>
      )
    }
  ];

  const emptyState = (
    <EmptyState
      icon={<CreditCard className="w-12 h-12" />}
      title="No subscriptions found"
      description={searchQuery ? "No subscriptions match your search criteria." : "Get started by creating your first subscription."}
      action={{
        label: "Create Subscription",
        onClick: () => setShowCreateModal(true)
      }}
    />
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Subscriptions</h3>
          <p className="text-sm text-white/60">Manage billing and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Subscription
        </button>
      </div>

      <DataTable
        columns={columns}
        data={subscriptions}
        totalCount={totalCount}
        isLoading={loading}
        searchable
        searchPlaceholder="Search subscriptions..."
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
        exportFilename="subscriptions"
      />

      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateForm({
            orgId: '',
            planId: '',
            status: 'pending',
            currentPeriodStart: '',
            currentPeriodEnd: '',
            trialEndsAt: ''
          });
        }}
        title="Create Subscription"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Organization *
            </label>
            <select
              value={createForm.orgId}
              onChange={(e) => setCreateForm({ ...createForm, orgId: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="">Select organization</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id} className="bg-black text-white">
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plan *
            </label>
            <select
              value={createForm.planId}
              onChange={(e) => setCreateForm({ ...createForm, planId: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="">Select plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-black text-white">
                  {plan.name} ({plan.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Status *
            </label>
            <select
              value={createForm.status}
              onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="pending" className="bg-black text-white">Pending</option>
              <option value="trial" className="bg-black text-white">Trial</option>
              <option value="active" className="bg-black text-white">Active</option>
              <option value="past_due" className="bg-black text-white">Past Due</option>
              <option value="cancelled" className="bg-black text-white">Cancelled</option>
              <option value="expired" className="bg-black text-white">Expired</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Period Start
              </label>
              <input
                type="date"
                value={createForm.currentPeriodStart}
                onChange={(e) => setCreateForm({ ...createForm, currentPeriodStart: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Period End
              </label>
              <input
                type="date"
                value={createForm.currentPeriodEnd}
                onChange={(e) => setCreateForm({ ...createForm, currentPeriodEnd: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Trial Ends At
            </label>
            <input
              type="date"
              value={createForm.trialEndsAt}
              onChange={(e) => setCreateForm({ ...createForm, trialEndsAt: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowCreateModal(false);
                setCreateForm({
                  orgId: '',
                  planId: '',
                  status: 'pending',
                  currentPeriodStart: '',
                  currentPeriodEnd: '',
                  trialEndsAt: ''
                });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubscription}
              disabled={!createForm.orgId || !createForm.planId}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Subscription
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingSubscription(null);
          setEditForm({
            planId: '',
            status: 'pending',
            currentPeriodStart: '',
            currentPeriodEnd: '',
            trialEndsAt: ''
          });
        }}
        title="Edit Subscription"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Organization
            </label>
            <input
              type="text"
              value={editingSubscription?.organization.name || ''}
              disabled
              className="w-full px-3 py-2 bg-black/20 border border-white/10 rounded text-white/40 cursor-not-allowed"
            />
            <p className="text-xs text-white/40 mt-1">
              Organization cannot be changed
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Plan *
            </label>
            <select
              value={editForm.planId}
              onChange={(e) => setEditForm({ ...editForm, planId: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="">Select plan</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id} className="bg-black text-white">
                  {plan.name} ({plan.tier})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Status *
            </label>
            <select
              value={editForm.status}
              onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'pending' | 'trial' | 'active' | 'past_due' | 'cancelled' | 'expired' })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            >
              <option value="pending" className="bg-black text-white">Pending</option>
              <option value="trial" className="bg-black text-white">Trial</option>
              <option value="active" className="bg-black text-white">Active</option>
              <option value="past_due" className="bg-black text-white">Past Due</option>
              <option value="cancelled" className="bg-black text-white">Cancelled</option>
              <option value="expired" className="bg-black text-white">Expired</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Period Start
              </label>
              <input
                type="date"
                value={editForm.currentPeriodStart}
                onChange={(e) => setEditForm({ ...editForm, currentPeriodStart: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Period End
              </label>
              <input
                type="date"
                value={editForm.currentPeriodEnd}
                onChange={(e) => setEditForm({ ...editForm, currentPeriodEnd: e.target.value })}
                className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Trial Ends At
            </label>
            <input
              type="date"
              value={editForm.trialEndsAt}
              onChange={(e) => setEditForm({ ...editForm, trialEndsAt: e.target.value })}
              className="w-full px-3 py-2 bg-black/30 border border-white/20 rounded text-white focus:border-white/40 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingSubscription(null);
                setEditForm({
                  planId: '',
                  status: 'pending',
                  currentPeriodStart: '',
                  currentPeriodEnd: '',
                  trialEndsAt: ''
                });
              }}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleEditSubscription}
              disabled={!editForm.planId}
              className="px-4 py-2 border border-white/20 hover:border-white/40 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Update Subscription
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};