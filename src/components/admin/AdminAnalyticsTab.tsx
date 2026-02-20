"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Workflow, 
  Handshake, 
  Store, 
  CreditCard, 
  DollarSign,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { StatCard, BarChart, LineChart, PieChart } from '@/components/ui';

interface AnalyticsData {
  summary: {
    totalUsers: number;
    totalFlows: number;
    totalDeals: number;
    totalProviders: number;
    activeSubscriptions: number;
    totalRevenue: number;
  };
  userGrowth: { date: string; count: number }[];
  flowActivity: { date: string; created: number; published: number }[];
  dealVolume: { date: string; count: number; volume: number }[];
  subscriptionsByPlan: { planName: string; count: number }[];
  providersByCategory: { category: string; count: number }[];
  recentActivity: { action: string; count: number }[];
}

interface AnalyticsResponse {
  data: AnalyticsData;
}

export const AdminAnalyticsTab: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error(`Failed to load analytics: ${response.statusText}`);
      }
      
      const result: AnalyticsResponse = await response.json();
      setData(result.data);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-white/10 bg-black/30 rounded p-5 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-3"></div>
              <div className="h-8 bg-white/10 rounded mb-2"></div>
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border border-white/10 bg-black/30 rounded p-6 animate-pulse">
              <div className="h-4 bg-white/10 rounded mb-4"></div>
              <div className="h-64 bg-white/10 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Failed to Load Analytics</h3>
        <p className="text-white/60 mb-6 text-center max-w-md">{error}</p>
        <button
          onClick={loadAnalytics}
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

  const userGrowthData = data.userGrowth.map(d => ({ 
    label: formatDate(d.date), 
    value: d.count 
  }));

  const flowActivityData = data.flowActivity.map(d => ({ 
    label: formatDate(d.date), 
    value: d.created + d.published 
  }));

  const dealVolumeData = data.dealVolume.map(d => ({ 
    label: formatDate(d.date), 
    value: d.volume 
  }));

  const subscriptionsPieData = data.subscriptionsByPlan.map((d, index) => ({ 
    label: d.planName, 
    value: d.count,
    color: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'][index % 4]
  }));

  const providersPieData = data.providersByCategory.map((d, index) => ({ 
    label: d.category, 
    value: d.count,
    color: ['rgba(255,255,255,0.4)', 'rgba(255,255,255,0.25)', 'rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)'][index % 4]
  }));

  const recentActivityData = data.recentActivity.map(d => ({ 
    label: d.action, 
    value: d.count 
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white/90">Platform Analytics</h3>
          <p className="text-sm text-white/60">Real-time insights and metrics</p>
        </div>
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={data.summary.totalUsers}
          icon={<Users className="w-5 h-5" />}
        />
        <StatCard
          title="Total Flows"
          value={data.summary.totalFlows}
          icon={<Workflow className="w-5 h-5" />}
        />
        <StatCard
          title="Total Deals"
          value={data.summary.totalDeals}
          icon={<Handshake className="w-5 h-5" />}
        />
        <StatCard
          title="Total Providers"
          value={data.summary.totalProviders}
          icon={<Store className="w-5 h-5" />}
        />
        <StatCard
          title="Active Subscriptions"
          value={data.summary.activeSubscriptions}
          icon={<CreditCard className="w-5 h-5" />}
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(data.summary.totalRevenue)}
          icon={<DollarSign className="w-5 h-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">User Growth</h3>
          <LineChart data={userGrowthData} height={250} />
        </div>
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">Flow Activity</h3>
          <BarChart data={flowActivityData} height={250} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">Deal Volume</h3>
          <LineChart data={dealVolumeData} height={250} />
        </div>
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">Subscriptions by Plan</h3>
          <div className="flex justify-center">
            <PieChart data={subscriptionsPieData} size={200} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">Providers by Category</h3>
          <div className="flex justify-center">
            <PieChart data={providersPieData} size={200} />
          </div>
        </div>
        <div className="border border-white/10 bg-black/30 rounded p-6">
          <h3 className="text-sm font-bold text-white/80 mb-4">Recent Activity</h3>
          <BarChart data={recentActivityData} height={250} />
        </div>
      </div>
    </motion.div>
  );
};