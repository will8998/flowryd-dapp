"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCantonAuth } from '@/lib/auth-context';
import {
  Shield,
  Users,
  Clock,
  Workflow,
  Handshake,
  UserPlus,
  Server,
  LayoutTemplate,
  AlertCircle,
  ArrowRight,
  Loader2,
  User,
} from 'lucide-react';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAuditTab } from '@/components/admin/AdminAuditTab';
import { AdminFlowsTab } from '@/components/admin/AdminFlowsTab';
import { AdminDealsTab } from '@/components/admin/AdminDealsTab';
import { AdminJoinRequestsTab } from '@/components/admin/AdminJoinRequestsTab';
import { AdminNodeApiTab } from '@/components/admin/AdminNodeApiTab';
import { AdminTemplatesTab } from '@/components/admin/AdminTemplatesTab';

type AdminView = 'users' | 'audit' | 'flows' | 'deals' | 'join-requests' | 'node-api' | 'templates';

const NAV_ITEMS: { id: AdminView; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'users', label: 'Users', icon: Users, description: 'Manage all users' },
  { id: 'audit', label: 'Audit Log', icon: Clock, description: 'Activity history' },
  { id: 'flows', label: 'Flows', icon: Workflow, description: 'All flows across orgs' },
  { id: 'deals', label: 'Deals', icon: Handshake, description: 'Active deals' },
  { id: 'join-requests', label: 'Join Requests', icon: UserPlus, description: 'Pending requests' },
  { id: 'node-api', label: 'Node API', icon: Server, description: 'Canton node configs' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Flow templates' },
];

export default function AdminPage() {
  const { user, isLoading } = useCantonAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('users');

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (user.role !== 'admin') {
        router.push('/');
        return;
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-white/60 mb-6">You need admin privileges to access this page.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const activeNavItem = NAV_ITEMS.find((item) => item.id === activeView);

  return (
    <div className="min-h-screen bg-[#020202] text-white flex">
      <div className="w-64 bg-black/40 backdrop-blur-xl border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-400" />
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/40">System Management</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                      : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-xs text-white/40">{item.description}</div>
                    </div>
                    {isActive && <div className="w-2 h-2 rounded-full bg-blue-400" />}
                  </div>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">{user.displayName}</div>
              <div className="text-xs text-white/40">Admin</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="bg-black/20 backdrop-blur-xl border-b border-white/5 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{activeNavItem?.label}</h2>
              <p className="text-white/60 text-sm">{activeNavItem?.description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="text-sm text-white/60 hover:text-white transition-colors"
              >
                ← Back to Main Site
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {activeView === 'users' && <AdminUsersTab currentUserId={user.id} />}
              {activeView === 'audit' && <AdminAuditTab />}
              {activeView === 'flows' && <AdminFlowsTab />}
              {activeView === 'deals' && <AdminDealsTab />}
              {activeView === 'join-requests' && <AdminJoinRequestsTab />}
              {activeView === 'node-api' && <AdminNodeApiTab />}
              {activeView === 'templates' && <AdminTemplatesTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}