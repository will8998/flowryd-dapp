"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserX, UserCheck } from 'lucide-react';

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

interface AdminUsersTabProps {
  currentUserId: string;
}

interface UsersResponse {
  data: {
    users: User[];
  };
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmingToggle, setConfirmingToggle] = useState<string | null>(null);

  const showBanner = (type: 'success' | 'error', message: string) => {
    setBanner({ type, message });
    setTimeout(() => setBanner(null), 3000);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.data.users);
      } else {
        showBanner('error', 'Failed to load users');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      showBanner('error', 'Failed to load users');
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
        const data = await response.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        showBanner('success', `User role updated to ${newRole}`);
      } else {
        showBanner('error', 'Failed to update user role');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      showBanner('error', 'Failed to update user role');
    }
  };

  const toggleUserActive = async (userId: string, isActive: boolean) => {
    if (confirmingToggle !== userId) {
      setConfirmingToggle(userId);
      return;
    }

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      });
      
      if (response.ok) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: !isActive } : u));
        showBanner('success', `User ${!isActive ? 'activated' : 'deactivated'} successfully`);
      } else {
        showBanner('error', 'Failed to update user status');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      showBanner('error', 'Failed to update user status');
    } finally {
      setConfirmingToggle(null);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          className={`mb-4 p-3 rounded-lg border text-sm ${
            banner.type === 'success'
              ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
              : 'bg-red-500/20 border border-red-500/30 text-red-400'
          }`}
        >
          {banner.message}
        </motion.div>
      )}

      <div className="bg-black/20 border border-white/5 rounded-2xl flex-1 flex flex-col overflow-hidden">
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
              <thead className="sticky top-0 bg-white/5 border-b border-white/5">
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
                  const isCurrentUser = user.id === currentUserId;
                  
                  return (
                    <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-sm font-bold">
                            {user.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-white">{user.displayName}</div>
                            {isCurrentUser && (
                              <div className="text-xs text-blue-400">(You)</div>
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
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                            user.role === 'admin' 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                              : user.role === 'editor'
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-white/20 text-white/60 border-white/30'
                          }`}>
                            {user.role}
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'editor' | 'viewer')}
                            className="bg-white/5 border border-white/10 hover:border-white/10 rounded px-2 py-1 text-xs text-white"
                          >
                            <option value="viewer">Viewer</option>
                            <option value="editor">Editor</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          <span className="text-xs text-white/60">
                            {user.isActive ? 'Active' : 'Inactive'}
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
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                              user.isActive 
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30' 
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                            }`}
                            title={user.isActive ? 'Deactivate user' : 'Activate user'}
                          >
                            {confirmingToggle === user.id ? (
                              'Confirm?'
                            ) : (
                              <>
                                {user.isActive ? (
                                  <>
                                    <UserX className="w-4 h-4 inline mr-1" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <UserCheck className="w-4 h-4 inline mr-1" />
                                    Activate
                                  </>
                                )}
                              </>
                            )}
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
  );
};