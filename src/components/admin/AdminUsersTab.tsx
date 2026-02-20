"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserX, UserCheck } from 'lucide-react';
import { DataTable, Badge, useToast, EmptyState } from '@/components/ui';

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
    total: number;
  };
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({ currentUserId }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('displayName');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [confirmingToggle, setConfirmingToggle] = useState<string | null>(null);
  
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
        search: searchQuery,
        sortBy,
        sortDir
      });
      
      const response = await fetch(`/api/admin/users?${params}`);
      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.data.users);
        setTotalCount(data.data.total);
      } else {
        toast('Failed to load users', 'error');
      }
    } catch (error) {
      console.error('Failed to load users:', error);
      toast('Failed to load users', 'error');
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
        await response.json();
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
        toast(`User role updated to ${newRole}`, 'success');
      } else {
        toast('Failed to update user role', 'error');
      }
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast('Failed to update user role', 'error');
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
        toast(`User ${!isActive ? 'activated' : 'deactivated'} successfully`, 'success');
      } else {
        toast('Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Failed to toggle user status:', error);
      toast('Failed to update user status', 'error');
    } finally {
      setConfirmingToggle(null);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadUsers();
  }, [page, pageSize, searchQuery, sortBy, sortDir]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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

  const columns = [
    {
      key: 'user',
      label: 'User',
      sortable: true,
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center text-sm font-bold">
            {user.displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-white">{user.displayName}</div>
            {user.id === currentUserId && (
              <div className="text-xs text-white/70">(You)</div>
            )}
          </div>
        </div>
      ),
    },
    {
      key: 'partyId',
      label: 'Party ID',
      render: (user: User) => (
        <code className="text-xs text-white/60 bg-white/5 px-2 py-1 rounded font-mono">
          {user.partyId}
        </code>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-white/80">{user.email}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (user: User) => {
        const isCurrentUser = user.id === currentUserId;
        return isCurrentUser ? (
          <Badge variant="default">
            {user.role}
          </Badge>
        ) : (
          <select
            value={user.role}
            onChange={(e) => updateUserRole(user.id, e.target.value as 'admin' | 'editor' | 'viewer')}
            className="bg-white/5 border border-white/10 hover:border-white/20 rounded px-2 py-1 text-xs text-white"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (user: User) => (
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-emerald-500/80' : 'bg-red-500/80'}`} />
          <span className="text-xs text-white/60">
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      ),
    },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      sortable: true,
      render: (user: User) => (
        <span className="text-sm text-white/60">
          {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user: User) => {
        const isCurrentUser = user.id === currentUserId;
        return !isCurrentUser ? (
          <button
            onClick={() => toggleUserActive(user.id, user.isActive)}
            className="border border-white/20 hover:border-white/40 text-white rounded px-3 py-1.5 text-sm transition-colors"
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
        ) : null;
      },
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
          <h2 className="text-lg font-bold text-white">Organization Users</h2>
          <p className="text-sm text-white/40 mt-1">Manage user roles and access</p>
        </div>
        
        <div className="flex-1 overflow-auto p-6">
          <DataTable
            columns={columns}
            data={users}
            totalCount={totalCount}
            isLoading={loading}
            searchable
            searchPlaceholder="Search users by name or email..."
            onSearch={handleSearch}
            sortBy={sortBy}
            sortDir={sortDir}
            onSort={handleSort}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            exportable
            exportFilename="users"
            getRowId={(user) => user.id}
            emptyState={
              <EmptyState
                title="No users found"
                description="No users match your search criteria"
              />
            }
          />
        </div>
      </div>
    </motion.div>
  );
};