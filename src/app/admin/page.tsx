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
  LayoutDashboard,
  AlertCircle,
  ArrowRight,
  Loader2,
  User,
  Building2,
  CreditCard,
  Store,
  Settings,
  BarChart3,
} from 'lucide-react';
import { AdminOverviewTab } from '@/components/admin/AdminOverviewTab';
import { AdminUsersTab } from '@/components/admin/AdminUsersTab';
import { AdminAuditTab } from '@/components/admin/AdminAuditTab';
import { AdminFlowsTab } from '@/components/admin/AdminFlowsTab';
import { AdminDealsTab } from '@/components/admin/AdminDealsTab';
import { AdminJoinRequestsTab } from '@/components/admin/AdminJoinRequestsTab';
import { AdminNodeApiTab } from '@/components/admin/AdminNodeApiTab';
import { AdminTemplatesTab } from '@/components/admin/AdminTemplatesTab';
import { AdminOrganizationsTab } from '@/components/admin/AdminOrganizationsTab';
import { AdminSubscriptionsTab } from '@/components/admin/AdminSubscriptionsTab';
import { AdminProvidersTab } from '@/components/admin/AdminProvidersTab';
import { AdminSystemSettingsTab } from '@/components/admin/AdminSystemSettingsTab';
import { AdminAnalyticsTab } from '@/components/admin/AdminAnalyticsTab';

type AdminView = 'overview' | 'users' | 'audit' | 'flows' | 'deals' | 'join-requests' | 'node-api' | 'templates' | 'analytics' | 'organizations' | 'subscriptions' | 'providers' | 'system-settings';

const CORE_NAV_ITEMS: { id: AdminView; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, description: 'Dashboard overview' },
  { id: 'users', label: 'Users', icon: Users, description: 'Manage all users' },
  { id: 'audit', label: 'Audit Log', icon: Clock, description: 'Activity history' },
  { id: 'flows', label: 'Flows', icon: Workflow, description: 'All flows across orgs' },
  { id: 'deals', label: 'Deals', icon: Handshake, description: 'Active deals' },
  { id: 'join-requests', label: 'Join Requests', icon: UserPlus, description: 'Pending requests' },
  { id: 'node-api', label: 'Node API', icon: Server, description: 'Canton node configs' },
  { id: 'templates', label: 'Templates', icon: LayoutTemplate, description: 'Flow templates' },
];

const MANAGEMENT_NAV_ITEMS: { id: AdminView; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Platform metrics & insights' },
  { id: 'organizations', label: 'Organizations', icon: Building2, description: 'Manage organizations' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, description: 'Billing & subscriptions' },
  { id: 'providers', label: 'Providers', icon: Store, description: 'Service providers' },
  { id: 'system-settings', label: 'System Settings', icon: Settings, description: 'Platform configuration' },
];

const NAV_ITEMS = [...CORE_NAV_ITEMS, ...MANAGEMENT_NAV_ITEMS];

export default function AdminPage() {
  const { user, isLoading } = useCantonAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('overview');

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
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/20 hover:border-white/40 text-white rounded transition-colors"
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
          <Shield className="w-8 h-8 text-white/70" />
          <div>
            <h1 className="text-xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-white/40">System Management</p>
          </div>
        </div>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-4">
            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
                Core
              </div>
              <div className="space-y-1">
                {CORE_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full text-left p-3 rounded transition-all ${
                        isActive
                          ? 'border border-white/30 bg-black/40 text-white'
                          : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-white/40">{item.description}</div>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-white/60" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="my-3 border-t border-white/5" />

            <div>
              <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-3">
                Management
              </div>
              <div className="space-y-1">
                {MANAGEMENT_NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveView(item.id)}
                      className={`w-full text-left p-3 rounded transition-all ${
                        isActive
                          ? 'border border-white/30 bg-black/40 text-white'
                          : 'hover:bg-white/5 text-white/70 hover:text-white border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <div className="flex-1">
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-white/40">{item.description}</div>
                        </div>
                        {isActive && <div className="w-2 h-2 rounded-full bg-white/60" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <User className="w-5 h-5 text-white/60" />
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
              {activeView === 'overview' && <AdminOverviewTab onNavigate={setActiveView} />}
              {activeView === 'users' && <AdminUsersTab currentUserId={user.id} />}
              {activeView === 'audit' && <AdminAuditTab />}
              {activeView === 'flows' && <AdminFlowsTab />}
              {activeView === 'deals' && <AdminDealsTab />}
              {activeView === 'join-requests' && <AdminJoinRequestsTab />}
              {activeView === 'node-api' && <AdminNodeApiTab />}
              {activeView === 'templates' && <AdminTemplatesTab />}
              {activeView === 'analytics' && <AdminAnalyticsTab />}
              {activeView === 'organizations' && <AdminOrganizationsTab />}
              {activeView === 'subscriptions' && <AdminSubscriptionsTab />}
              {activeView === 'providers' && <AdminProvidersTab />}
              {activeView === 'system-settings' && <AdminSystemSettingsTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}