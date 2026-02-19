"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCantonAuth } from '@/lib/auth-context';
import { workflows } from '@/lib/canton-data';
import { 
  LayoutDashboard, 
  Workflow, 
  MessageSquare, 
  Shield, 
  Search, 
  Edit3, 
  ArrowRight, 
  ChevronRight,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2
} from 'lucide-react';

interface Flow {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  createdBy: string;
  orgId: string;
  createdAt: string;
  updatedAt: string;
}

interface Deal {
  id: string;
  title: string;
  description: string | null;
  status: 'draft' | 'open' | 'negotiating' | 'locked' | 'committed';
  volume: string | null;
  createdAt: string;
  updatedAt: string;
  orgId: string;
}

type AdminView = 'flows' | 'deals' | 'jump-cuts';

export default function AdminPage() {
  const { user, isLoading } = useCantonAuth();
  const router = useRouter();
  const [activeView, setActiveView] = useState<AdminView>('flows');
  
  const [flows, setFlows] = useState<Flow[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [flowsLoading, setFlowsLoading] = useState(false);
  const [dealsLoading, setDealsLoading] = useState(false);
  
  const [flowFilter, setFlowFilter] = useState('');
  const [flowStatusFilter, setFlowStatusFilter] = useState<string>('');
  const [dealFilter, setDealFilter] = useState('');
  const [dealStatusFilter, setDealStatusFilter] = useState<string>('');

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

  useEffect(() => {
    if (user?.role === 'admin') {
      if (activeView === 'flows') {
        fetchFlows();
      } else if (activeView === 'deals') {
        fetchDeals();
      }
    }
  }, [activeView, user]);

  const fetchFlows = async () => {
    setFlowsLoading(true);
    try {
      const response = await fetch('/api/flows');
      if (response.ok) {
        const data = await response.json();
        setFlows(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching flows:', error);
    } finally {
      setFlowsLoading(false);
    }
  };

  const fetchDeals = async () => {
    setDealsLoading(true);
    try {
      const response = await fetch('/api/deals');
      if (response.ok) {
        const data = await response.json();
        setDeals(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setDealsLoading(false);
    }
  };

  const filteredFlows = flows.filter(flow => {
    const matchesSearch = flow.title.toLowerCase().includes(flowFilter.toLowerCase()) ||
                         (flow.description || '').toLowerCase().includes(flowFilter.toLowerCase());
    const matchesStatus = !flowStatusFilter || flow.status === flowStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDeals = deals.filter(deal => {
    const matchesSearch = deal.title.toLowerCase().includes(dealFilter.toLowerCase()) ||
                         (deal.description || '').toLowerCase().includes(dealFilter.toLowerCase());
    const matchesStatus = !dealStatusFilter || deal.status === dealStatusFilter;
    return matchesSearch && matchesStatus;
  });

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

        <nav className="flex-1 p-4">
          <div className="space-y-2">
            {[
              { id: 'flows', label: 'Flows', icon: Workflow, description: 'All flows across orgs' },
              { id: 'deals', label: 'Deals', icon: MessageSquare, description: 'Active deals' },
              { id: 'jump-cuts', label: 'Jump Cuts', icon: LayoutDashboard, description: 'Template workflows' }
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as AdminView)}
                  className={`w-full text-left p-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-blue-500/20 border border-blue-500/30 text-white' 
                      : 'hover:bg-white/5 text-white/70 hover:text-white'
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
              <h2 className="text-2xl font-bold capitalize">{activeView.replace('-', ' ')}</h2>
              <p className="text-white/60 text-sm">
                {activeView === 'flows' && `Manage all flows across ${filteredFlows.length} organizations`}
                {activeView === 'deals' && `Monitor active deals and transactions`}
                {activeView === 'jump-cuts' && `Configure workflow templates`}
              </p>
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

        <main className="flex-1 p-6">
          <AnimatePresence mode="wait">
            {activeView === 'flows' && (
              <motion.div
                key="flows"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search flows..."
                        value={flowFilter}
                        onChange={(e) => setFlowFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <select
                      value={flowStatusFilter}
                      onChange={(e) => setFlowStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">All statuses</option>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden">
                  {flowsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-400" />
                      <p className="text-white/60">Loading flows...</p>
                    </div>
                  ) : filteredFlows.length === 0 ? (
                    <div className="p-8 text-center">
                      <Workflow className="w-12 h-12 mx-auto mb-3 text-white/20" />
                      <p className="text-white/60">No flows found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="text-left p-4 font-semibold text-white/80">Title</th>
                            <th className="text-left p-4 font-semibold text-white/80">Status</th>
                            <th className="text-left p-4 font-semibold text-white/80">Organization</th>
                            <th className="text-left p-4 font-semibold text-white/80">Created</th>
                            <th className="text-left p-4 font-semibold text-white/80">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredFlows.map((flow) => (
                            <tr key={flow.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div>
                                  <div className="font-medium text-white">{flow.title}</div>
                                  {flow.description && (
                                    <div className="text-sm text-white/60 truncate max-w-xs">
                                      {flow.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  flow.status === 'published' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  flow.status === 'draft' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  {flow.status === 'published' && <CheckCircle2 className="w-3 h-3" />}
                                  {flow.status.charAt(0).toUpperCase() + flow.status.slice(1)}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-white/60 text-sm">{flow.orgId.slice(0, 8)}...</span>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-white/60">
                                  {new Date(flow.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-white/60">
                                  {new Date(flow.updatedAt).toLocaleDateString()}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'deals' && (
              <motion.div
                key="deals"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="text"
                        placeholder="Search deals..."
                        value={dealFilter}
                        onChange={(e) => setDealFilter(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <select
                      value={dealStatusFilter}
                      onChange={(e) => setDealStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-blue-500/50"
                    >
                      <option value="">All statuses</option>
                      <option value="draft">Draft</option>
                      <option value="open">Open</option>
                      <option value="negotiating">Negotiating</option>
                      <option value="locked">Locked</option>
                      <option value="committed">Committed</option>
                    </select>
                  </div>
                </div>

                <div className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg overflow-hidden">
                  {dealsLoading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-400" />
                      <p className="text-white/60">Loading deals...</p>
                    </div>
                  ) : filteredDeals.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-white/20" />
                      <p className="text-white/60">No deals found</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-white/5 border-b border-white/5">
                          <tr>
                            <th className="text-left p-4 font-semibold text-white/80">Title</th>
                            <th className="text-left p-4 font-semibold text-white/80">Status</th>
                            <th className="text-left p-4 font-semibold text-white/80">Volume</th>
                            <th className="text-left p-4 font-semibold text-white/80">Created</th>
                            <th className="text-left p-4 font-semibold text-white/80">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredDeals.map((deal) => (
                            <tr key={deal.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="p-4">
                                <div>
                                  <div className="font-medium text-white">{deal.title}</div>
                                  {deal.description && (
                                    <div className="text-sm text-white/60 truncate max-w-xs">
                                      {deal.description}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                  deal.status === 'committed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  deal.status === 'locked' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                  deal.status === 'negotiating' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                  deal.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                  'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                                }`}>
                                  {deal.status.charAt(0).toUpperCase() + deal.status.slice(1)}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-white/60 text-sm">
                                  {deal.volume || 'Not specified'}
                                </span>
                              </td>
                              <td className="p-4">
                                <div className="text-sm text-white/60">
                                  {new Date(deal.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="p-4">
                                <Link
                                  href={`/deals/${deal.id}`}
                                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-sm hover:bg-blue-500/30 transition-colors"
                                >
                                  View <ChevronRight className="w-3 h-3" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeView === 'jump-cuts' && (
              <motion.div
                key="jump-cuts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">
                      Manage workflow templates from Canton Data ({workflows.length} templates)
                    </p>
                  </div>
                </div>

                <div className="grid gap-6">
                  {workflows.map((workflow) => (
                    <motion.div
                      key={workflow.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-black/20 backdrop-blur-xl border border-white/5 rounded-lg p-6 hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <LayoutDashboard className="w-6 h-6 text-blue-400" />
                            <h3 className="text-xl font-bold text-white">{workflow.name}</h3>
                          </div>
                          <p className="text-white/60 mb-4">{workflow.description}</p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors">
                          <Edit3 className="w-4 h-4" />
                          Edit Template
                        </button>
                      </div>

                      <div className="mb-4">
                        <h4 className="text-sm font-semibold text-white/80 mb-3">Workflow Stages</h4>
                        <div className="grid gap-3">
                          {workflow.stages.map((stage, index) => (
                            <div key={index} className="bg-white/5 rounded-lg p-4 border border-white/5">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">
                                  {index + 1}
                                </span>
                                <h5 className="font-medium text-white">{stage.name}</h5>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {stage.roles.map((role) => (
                                  <span
                                    key={role}
                                    className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded border border-blue-500/20"
                                  >
                                    {role.replace('_', ' ')}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold text-white/80 mb-3">
                          Required Roles ({workflow.roles.length})
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {workflow.roles.map((role) => (
                            <span
                              key={role}
                              className="px-3 py-1 bg-gray-500/10 text-gray-300 text-sm rounded border border-gray-500/20"
                            >
                              {role.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}