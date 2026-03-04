"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Shield, 
  UserX, 
  UserCheck, 
  Clock,
  CreditCard,
  Crown,
  Workflow,
} from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import { useSubscription } from '@/hooks/use-subscription';
import { BillingPanel } from './BillingPanel';
import { JumpCutsManager } from './JumpCutsManager';

interface User {
  id: string;
  partyId: string;
  displayName: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  lastLoginAt: string;
  createdAt: string;
}

interface AuditEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  ipAddress: string;
  createdAt: string;
  userDisplayName: string;
  userPartyId: string;
}

interface UsersResponse {
  data: {
    users: User[];
  };
}

interface AuditResponse {
  data: AuditEntry[];
  cursor?: string;
  hasMore: boolean;
}

type Tab = 'users' | 'audit' | 'billing' | 'jumpcuts';

const AUDIT_ACTIONS = [
  'user.register', 'user.login', 'user.logout', 'user.role_change',
  'flow.create', 'flow.update', 'flow.publish', 'flow.delete', 'flow.version',
  'deal.create', 'deal.status_change', 'deal.participant_add', 'deal.participant_remove',
  'room.create', 'room.join', 'room.leave', 'message.send', 'file.upload',
  'subscription.create', 'subscription.cancel', 'subscription.renew',
  'provider.apply', 'provider.approve', 'provider.reject'
];

const RESOURCE_TYPES = ['user', 'flow', 'deal', 'room', 'message', 'file', 'subscription', 'provider', 'provider_application'];

const TIERS = ['discover', 'navigate', 'activate'] as const;

const TIER_LABELS: Record<string, string> = {
  discover: 'Discover',
  navigate: 'Navigate',
  activate: 'Activate',
};

const TIER_COLORS: Record<string, string> = {
  discover: 'white',
  navigate: 'blue',
  activate: 'emerald',
};

export interface AdminPanelProps {
  onSelectJumpCut?: (jumpCut: { id: string; name: string; nodes: Array<{ role: string; participantId: string; position: { x: number; y: number } }> }) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onSelectJumpCut }) => {
  const { user: currentUser } = useCantonAuth();
  const { subscription, refetch: refetchSubscription } = useSubscription();
  const [activeTab, setActiveTab] = useState<Tab>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState<string>();
  const [hasMore, setHasMore] = useState(false);
  const [tierUpdating, setTierUpdating] = useState(false);

  const [actionFilter, setActionFilter] = useState<string>('');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const currentTier = (subscription as { plan?: { tier?: string } })?.plan?.tier ?? null;

  const updateOrgTier = async (tier: string) => {
    try {
      setTierUpdating(true);
      const res = await fetch('/api/admin/subscriptions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      if (res.ok) {
        await refetchSubscription();
      }
    } catch (error) {
      console.error('Failed to update tier:', error);
    } finally {
      setTierUpdating(false);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.data.users);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async (resetCursor = false) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (actionFilter) params.append('action', actionFilter);
      if (resourceTypeFilter) params.append('resourceType', resourceTypeFilter);
      if (dateFrom) params.append('from', dateFrom);
      if (dateTo) params.append('to', dateTo);
      if (!resetCursor && cursor) params.append('cursor', cursor);
      params.append('limit', '50');

      const response = await fetch(`/api/admin/audit?${params}`);
      if (response.ok) {
        const data: AuditResponse = await response.json();
        if (resetCursor) {
          setAuditLogs(data.data);
        } else {
          setAuditLogs(prev => [...prev, ...data.data]);
        }
        setCursor(data.cursor);
        setHasMore(data.hasMore);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'admin' | 'editor' | 'viewer') => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadAuditLogs(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (activeTab === 'audit') {
      loadAuditLogs(true);
    }
  }, [actionFilter, resourceTypeFilter, dateFrom, dateTo]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'white';
      case 'editor': return 'white';
      case 'viewer': return 'white';
      default: return 'white';
    }
  };

  const _getActionColor = (_action: string) => {
    return 'white';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-full flex flex-col bg-[#020202] text-white overflow-hidden"
    >
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 border border-white/10 rounded">
            <Shield className="w-6 h-6 text-white/70" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
            <p className="text-sm text-white/40 mt-1">Manage users and monitor system activity</p>
          </div>
        </div>

        <div className="flex gap-2 mt-6">
          {[
            { id: 'users' as Tab, label: 'User Management', icon: Users },
            { id: 'jumpcuts' as Tab, label: 'Jump Cuts', icon: Workflow },
            { id: 'audit' as Tab, label: 'Audit Log', icon: Clock },
            { id: 'billing' as Tab, label: 'Billing', icon: CreditCard }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'border border-white/30 bg-black/40 text-white' 
                  : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-8 overflow-y-auto custom-scrollbar min-h-0">
        <AnimatePresence mode="wait">
          {activeTab === 'users' && (
            <motion.div
              key="users"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col gap-4"
            >
              <div className="border border-white/10 bg-black/30 rounded p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                      <Crown className="w-4 h-4 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Organization Tier</h3>
                      <p className="text-xs text-white/40">
                        {currentTier
                          ? `Current: ${TIER_LABELS[currentTier] ?? currentTier}`
                          : 'No active subscription'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {TIERS.map((tier) => {
                      const isActive = currentTier === tier;
                      const _color = TIER_COLORS[tier];
                      return (
                        <button
                          key={tier}
                          onClick={() => updateOrgTier(tier)}
                          disabled={tierUpdating || isActive}
                          className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                            isActive
                              ? 'border border-white/30 bg-white/10 text-white'
                              : 'border border-white/20 hover:border-white/40 text-white/40 hover:text-white bg-transparent'
                          } disabled:opacity-50`}
                        >
                          {TIER_LABELS[tier]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-black/30 rounded flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">Organization Users</h2>
                  <p className="text-sm text-white/40 mt-1">Manage user roles and access</p>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white/40">Loading users...</div>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="sticky top-0 bg-[#0a0a0a] border-b border-white/5">
                        <tr className="text-left">
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">User</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Party ID</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Email</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Role</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Status</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Last Login</th>
                          <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map(user => {
                          const isCurrentUser = user.id === currentUser?.id;
                          const _roleColor = getRoleColor(user.role);
                          
                          return (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                   <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm font-bold">
                                    {user.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-medium text-white">{user.displayName}</div>
                                    {isCurrentUser && (
                                       <div className="text-xs text-white/60">(You)</div>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded font-mono">
                                  {user.partyId}
                                </code>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80">{user.email}</td>
                              <td className="px-6 py-4">
                                {isCurrentUser ? (
                                   <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[8px] font-bold tracking-wide text-white/60">
                                    {user.role}
                                  </span>
                                ) : (
                                  <select
                                    value={user.role}
                                    onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'editor' | 'viewer')}
                                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white"
                                  >
                                    <option value="viewer">Viewer</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                   <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-white/60' : 'bg-white/20'}`} />
                                  <span className="text-xs text-white/60">
                                    {user.isActive ? 'Active' : 'Deactivated'}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/60">
                                {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                              </td>
                              <td className="px-6 py-4">
                                {!isCurrentUser && (
                                  <button
                                    onClick={() => toggleUserActive(user.id, user.isActive)}
                                     className={`p-2 rounded transition-colors ${
                                       user.isActive 
                                         ? 'text-white/60 hover:bg-white/10' 
                                         : 'text-white/40 hover:bg-white/5'
                                     }`}
                                    title={user.isActive ? 'Deactivate user' : 'Reactivate user'}
                                  >
                                    {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'jumpcuts' && (
            <motion.div
              key="jumpcuts"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <JumpCutsManager onSelectJumpCut={onSelectJumpCut} />
            </motion.div>
          )}

          {activeTab === 'audit' && (
            <motion.div
              key="audit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full flex flex-col"
            >
              <div className="flex gap-4 mb-6">
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">All Actions</option>
                  {AUDIT_ACTIONS.map(action => (
                    <option key={action} value={action}>{action}</option>
                  ))}
                </select>

                <select
                  value={resourceTypeFilter}
                  onChange={(e) => setResourceTypeFilter(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="">All Resources</option>
                  {RESOURCE_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white"
                  placeholder="From date"
                />

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm text-white"
                  placeholder="To date"
                />
              </div>

              <div className="border border-white/10 bg-black/30 rounded flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-white/5">
                  <h2 className="text-lg font-bold text-white">System Audit Log</h2>
                  <p className="text-sm text-white/40 mt-1">Track all system activities and changes</p>
                </div>
                
                <div className="flex-1 overflow-auto">
                  {loading && auditLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-white/40">Loading audit logs...</div>
                    </div>
                  ) : (
                    <>
                      <table className="w-full">
                        <thead className="sticky top-0 bg-black/30 border-b border-white/5">
                          <tr className="text-left">
                             <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Timestamp</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">User</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Action</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Resource</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-white/40 tracking-wide">IP Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auditLogs.map(entry => {
                            const _actionColor = _getActionColor(entry.action);
                            
                            return (
                              <tr key={entry.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-sm text-white/60">
                                  {formatDate(entry.createdAt)}
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm text-white font-medium">{entry.userDisplayName}</div>
                                    <div className="text-xs text-white/40 font-mono">{entry.userPartyId}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                   <span className="px-2 py-0.5 bg-white/10 border border-white/20 rounded-full text-[8px] font-bold tracking-wide text-white/60">
                                    {entry.action}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm text-white/80">{entry.resourceType}</div>
                                    {entry.resourceId && (
                                      <div className="text-xs text-white/40 font-mono truncate max-w-32">
                                        {entry.resourceId}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-xs text-white/60 max-w-48 truncate">
                                    {JSON.stringify(entry.metadata)}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-white/60 font-mono">
                                  {entry.ipAddress}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>

                      {hasMore && (
                        <div className="p-6 border-t border-white/5 text-center">
                          <button
                            onClick={() => loadAuditLogs(false)}
                            disabled={loading}
                            className="px-6 py-2 border border-white/20 text-white/60 rounded hover:border-white/40 font-medium transition-colors disabled:opacity-50"
                          >
                            {loading ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'billing' && (
            <motion.div
              key="billing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto custom-scrollbar"
            >
              <BillingPanel />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};