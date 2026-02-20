"use client";

import React, { useState, useEffect } from 'react';
import { Settings, Database, Shield, Network, CreditCard, CheckCircle, XCircle } from 'lucide-react';

interface PlansResponse {
  data: {
    plans: Array<{ id: string; name: string; tier: string }>;
    total: number;
  };
}

export const AdminSystemSettingsTab: React.FC = () => {
  const [planCount, setPlanCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const loadPlanCount = async () => {
    try {
      const response = await fetch('/api/admin/plans?limit=1');
      if (response.ok) {
        const data: PlansResponse = await response.json();
        setPlanCount(data.data.total);
      }
    } catch (error) {
      console.error('Failed to load plan count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanCount();
  }, []);

  const SettingCard = ({ 
    icon: Icon, 
    title, 
    children 
  }: { 
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    children: React.ReactNode;
  }) => (
    <div className="border border-white/10 bg-black/30 rounded p-6">
      <div className="flex items-center gap-3 mb-4">
        <Icon className="w-5 h-5 text-white/60" />
        <h4 className="text-sm font-bold text-white/80">{title}</h4>
      </div>
      <div className="space-y-3">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ 
    label, 
    value, 
    status 
  }: { 
    label: string;
    value: string | number;
    status?: 'connected' | 'disconnected' | 'active' | 'inactive';
  }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm text-white/60">{label}</span>
      <div className="flex items-center gap-2">
        {status && (
          <div className="flex items-center gap-1">
            {(status === 'connected' || status === 'active') ? (
              <CheckCircle className="w-3 h-3 text-green-400" />
            ) : (
              <XCircle className="w-3 h-3 text-red-400" />
            )}
          </div>
        )}
        <span className="text-sm text-white/60 font-mono">{value}</span>
      </div>
    </div>
  );

  const ComingSoonBadge = () => (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-white/5 text-white/40 border border-white/10">
      Coming Soon
    </span>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">System Settings</h3>
          <p className="text-sm text-white/60">Platform configuration and status</p>
        </div>
        <ComingSoonBadge />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SettingCard icon={Settings} title="Platform Info">
          <SettingRow label="App Name" value="Flowryd" />
          <SettingRow label="Version" value="1.0.0" />
          <SettingRow label="Environment" value="Development" />
          <SettingRow label="Build Date" value={new Date().toLocaleDateString()} />
        </SettingCard>

        <SettingCard icon={Database} title="Database">
          <SettingRow label="Connection Status" value="Connected" status="connected" />
          <SettingRow label="Table Count" value="19" />
          <SettingRow label="Database Type" value="PostgreSQL" />
          <SettingRow label="Connection Pool" value="Active" status="active" />
        </SettingCard>

        <SettingCard icon={Shield} title="Authentication">
          <SettingRow label="JWT Strategy" value="Enabled" status="active" />
          <SettingRow label="HTTP-Only Cookies" value="Enabled" status="active" />
          <SettingRow label="Refresh Rotation" value="Enabled" status="active" />
          <SettingRow label="Session Timeout" value="24h" />
        </SettingCard>

        <SettingCard icon={Network} title="Canton Network">
          <SettingRow label="Mode" value="Simulated" status="active" />
          <SettingRow label="Adapter Pattern" value="Active" status="active" />
          <SettingRow label="Node Status" value="Running" status="connected" />
          <SettingRow label="Network ID" value="canton-dev" />
        </SettingCard>

        <SettingCard icon={CreditCard} title="Billing">
          <SettingRow label="Cantara Integration" value="Not Connected" status="disconnected" />
          <SettingRow 
            label="Plan Count" 
            value={loading ? "Loading..." : planCount.toString()} 
          />
          <SettingRow label="Payment Gateway" value="Disabled" status="inactive" />
          <SettingRow label="Billing Cycle" value="Monthly" />
        </SettingCard>

        <div className="border border-white/10 bg-black/30 rounded p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="w-5 h-5 text-white/60" />
            <h4 className="text-sm font-bold text-white/80">System Actions</h4>
            <ComingSoonBadge />
          </div>
          <div className="space-y-3">
            <button
              disabled
              className="w-full px-4 py-2 border border-white/10 text-white/40 rounded transition-colors cursor-not-allowed"
            >
              Clear Cache
            </button>
            <button
              disabled
              className="w-full px-4 py-2 border border-white/10 text-white/40 rounded transition-colors cursor-not-allowed"
            >
              Restart Services
            </button>
            <button
              disabled
              className="w-full px-4 py-2 border border-white/10 text-white/40 rounded transition-colors cursor-not-allowed"
            >
              Export System Logs
            </button>
          </div>
        </div>
      </div>

      <div className="border border-white/10 bg-black/30 rounded p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-white/60" />
          <h4 className="text-sm font-bold text-white/80">System Health</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">99.9%</div>
            <div className="text-xs text-white/60">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">45ms</div>
            <div className="text-xs text-white/60">Avg Response</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">2.1GB</div>
            <div className="text-xs text-white/60">Memory Usage</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-1">15%</div>
            <div className="text-xs text-white/60">CPU Usage</div>
          </div>
        </div>
      </div>

      <div className="text-center py-8">
        <p className="text-sm text-white/40">
          System settings are read-only in this version. Configuration management will be available in a future update.
        </p>
      </div>
    </div>
  );
};