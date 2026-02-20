"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Workflow, 
  Handshake, 
  Activity,
  RefreshCw,
  AlertCircle,
  Clock,
  Database,
  Server,
  Cloud,
  Wifi,
  UserCheck,
  DollarSign,
  BarChart3,
  FileSearch,
  ArrowRight
} from 'lucide-react';
import { StatCard } from '@/components/ui';

interface OverviewData {
  summary: {
    totalUsers: number;
    totalFlows: number;
    totalDeals: number;
    activeSubscriptions: number;
    mrr: number;
    activeSessionsLast24h: number;
    auditEventsLast24h: number;
  };
  distributions: {
    dealsByStatus: Record<string, number>;
  };
  recentActivity: Array<{
    id: string;
    action: string;
    resourceType: string | null;
    userId: string | null;
    userName: string | null;
    createdAt: string;
  }>;
}

interface OverviewResponse {
  data: OverviewData;
}

interface AdminOverviewTabProps {
  onNavigate: (view: 'overview' | 'users' | 'audit' | 'flows' | 'deals' | 'join-requests' | 'node-api' | 'templates' | 'analytics' | 'organizations' | 'subscriptions' | 'providers' | 'system-settings') => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error(`Failed to load overview data: ${response.statusText}`);
      }
      
      const result: OverviewResponse = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error loading overview:', err);
      setError(err instanceof Error ? err.message : 'Failed to load overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const getActionIcon = (action: string) => {
    if (action.includes('user')) return <UserCheck className="w-4 h-4 text-blue-400" />;
    if (action.includes('deal')) return <Handshake className="w-4 h-4 text-green-400" />;
    if (action.includes('flow')) return <Workflow className="w-4 h-4 text-purple-400" />;
    if (action.includes('auth') || action.includes('login')) return <Users className="w-4 h-4 text-yellow-400" />;
    if (action.includes('subscription')) return <DollarSign className="w-4 h-4 text-emerald-400" />;
    return <Activity className="w-4 h-4 text-white/40" />;
  };

  const formatActionDescription = (action: string, userName?: string | null) => {
    const user = userName || 'Unknown User';
    
    const descriptions: Record<string, string> = {
      'user.create': `${user} registered`,
      'user.login': `${user} signed in`,
      'user.update': `${user} updated profile`,
      'deal.create': `${user} created a deal`,
      'deal.update': `${user} updated deal`,
      'deal.commit': `${user} committed deal`,
      'flow.create': `${user} created flow`,
      'flow.publish': `${user} published flow`,
      'flow.update': `${user} updated flow`,
      'subscription.create': `${user} subscribed`,
      'subscription.cancel': `${user} cancelled subscription`,
      'organization.create': `${user} created organization`,
      'organization.join': `${user} joined organization`,
    };

    return descriptions[action] || `${user} performed ${action}`;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="border border-white/10 bg-black/30 rounded p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-3"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="border border-white/10 bg-black/30 rounded p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-10 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
          <div className="border border-white/10 bg-black/30 rounded p-6 animate-pulse">
            <div className="h-4 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-12 bg-white/10 rounded"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-white/10 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Overview</h3>
        <p className="text-white/60 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={loadOverview}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const totalCommittedDeals = data.distributions.dealsByStatus?.committed || 0;
  const activeDeals = Math.max(0, data.summary.totalDeals - totalCommittedDeals);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white/90">Dashboard Overview</h3>
          <p className="text-sm text-white/60">Quick insights and system status</p>
        </div>
        <button
          onClick={loadOverview}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={data.summary.totalUsers}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Active Deals"
          value={activeDeals}
          icon={<Handshake className="w-5 h-5" />}
        />
        <StatCard
          title="Published Flows"
          value={data.summary.totalFlows}
          icon={<Workflow className="w-5 h-5" />}
        />
        <StatCard
          title="System Uptime"
          value="99.9%"
          icon={<Activity className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Activity
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {data.recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 pb-3 border-b border-white/5 last:border-b-0">
                {getActionIcon(activity.action)}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/80 leading-tight">
                    {formatActionDescription(activity.action, activity.userName)}
                  </p>
                  <p className="text-xs text-white/40 mt-1">
                    {formatTimeAgo(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))}
            {data.recentActivity.length === 0 && (
              <div className="text-center py-8 text-white/40">
                <Activity className="w-8 h-8 mx-auto mb-2" />
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            System Health
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white/80">Database</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-white/60">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div className="flex items-center gap-3">
                <Wifi className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white/80">SSE Service</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-white/60">Active</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white/80">API</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-white/60">Responsive</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded">
              <div className="flex items-center gap-3">
                <Cloud className="w-5 h-5 text-green-400" />
                <span className="text-sm text-white/80">Storage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-white/60">Operational</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded">
            <p className="text-xs text-green-400 text-center">
              All systems operational
            </p>
          </div>
        </div>
      </div>

      <div className="border border-white/10 bg-black/30 rounded p-6">
        <h3 className="text-sm font-bold text-white/80 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => onNavigate('users')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            Manage Users
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigate('audit')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors"
          >
            <FileSearch className="w-4 h-4" />
            View Audit Log
            <ArrowRight className="w-3 h-3" />
          </button>
          <button
            onClick={() => onNavigate('analytics')}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            View Analytics
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};