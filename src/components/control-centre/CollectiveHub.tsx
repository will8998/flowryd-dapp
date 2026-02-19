"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Workflow, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  Plus,
  Loader2,
  CheckCircle2,
  Search,
  Briefcase,
  Package,
} from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';
import { useProviders } from '@/hooks/use-providers';
import { PROVIDER_CATEGORIES } from '@/lib/providers-data';
import { participants } from '@/lib/canton-data';
import { LiquidGlass } from './LiquidPrimitives';

interface PublicFlow {
  id: string;
  title: string;
  description: string | null;
  workflowType: string | null;
  orgId: string;
  createdAt: string;
  creatorDisplayName: string | null;
}

export const CollectiveHub: React.FC = () => {
  const { user } = useCantonAuth();
  const [flows, setFlows] = useState<PublicFlow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [joinedIds, setJoinedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flows' | 'service' | 'appStack'>('flows');
  const [providerCategory, setProviderCategory] = useState<string | null>(null);
  const { providers: serviceProviders, isLoading: providersLoading } = useProviders();

  const fetchFlows = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/flows/public');
      if (res.ok) {
        const json = await res.json();
        setFlows(json.data ?? []);
      }
    } catch {
      console.error('Failed to fetch public flows');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlows();
  }, [fetchFlows]);

  const handleJoin = async (flowId: string) => {
    setJoiningId(flowId);
    try {
      const res = await fetch(`/api/flows/${flowId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setJoinedIds(prev => new Set(prev).add(flowId));
      } else {
        const json = await res.json();
        if (json.error?.code === 'CONFLICT') {
          setJoinedIds(prev => new Set(prev).add(flowId));
        }
      }
    } catch {
      console.error('Failed to join flow');
    } finally {
      setJoiningId(null);
    }
  };

  const workflowTypes = Array.from(new Set(flows.map(f => f.workflowType).filter(Boolean))) as string[];

  const filteredFlows = flows.filter(f => {
    if (searchQuery && !f.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !f.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (selectedType && f.workflowType !== selectedType) return false;
    return true;
  });

  const isOwnFlow = (flow: PublicFlow) => flow.orgId === user?.orgId;

  return (
    <div className="h-full flex flex-col p-10 space-y-10 overflow-y-auto custom-scrollbar bg-[#020202]">
      <div className="flex justify-between items-end bg-black/20 backdrop-blur-md p-8 border border-white/5 rounded-[40px]">
        <div className="space-y-1">
          <h2 className="text-4xl font-bold tracking-tight text-emerald-500">Marketplace</h2>
          <p className="text-white/40 text-sm lowercase tracking-tight">Public workflows available to join</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
            <input
              type="text"
              placeholder="Search flows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-9 pr-4 text-[10px] w-48 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          {workflowTypes.length > 0 && (
            <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl">
              <button
                onClick={() => setSelectedType(null)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wide transition-all ${!selectedType ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-white/40 hover:text-white'}`}
              >
                All
              </button>
              {workflowTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-wide transition-all ${selectedType === type ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-white/40 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('flows')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'flows' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Workflow className="w-4 h-4" />
            Browse Flows
          </button>
          <button
            onClick={() => setActiveTab('service')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'service' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Service Providers
          </button>
          <button
            onClick={() => setActiveTab('appStack')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === 'appStack' 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'text-white/40 hover:text-white hover:bg-white/5'
            }`}
          >
            <Package className="w-4 h-4" />
            App Stack Providers
          </button>
        </div>
      </div>

      {activeTab === 'flows' && (
        <>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : filteredFlows.length === 0 ? (
            <div className="text-center py-20">
              <Globe className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No public flows available</p>
              <p className="text-white/15 text-xs mt-1">Publish a flow and mark it public to appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredFlows.map((flow, i) => (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="group"
                >
                  <LiquidGlass className="p-10 space-y-8 hover:border-emerald-500/30 transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                    <Workflow className="w-16 h-16" />
                  </div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      </div>
                      {flow.workflowType && (
                        <span className="text-[10px] font-bold text-emerald-500/60 tracking-wide">{flow.workflowType}</span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight leading-tight">{flow.title}</h3>
                    {flow.description && (
                      <p className="text-sm text-white/40 leading-relaxed font-medium lowercase tracking-tight line-clamp-2">{flow.description}</p>
                    )}
                  </div>

                  <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                      <span className="text-white/20">Created by</span>
                      <span className="text-white/80">{flow.creatorDisplayName ?? 'Unknown'}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold tracking-wide">
                      <span className="text-white/20">Published</span>
                      <span className="text-white/60">{new Date(flow.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {isOwnFlow(flow) ? (
                      <div className="w-full py-4 bg-white/5 text-white/30 rounded-2xl font-bold text-xs tracking-wide text-center">
                        Your Flow
                      </div>
                    ) : joinedIds.has(flow.id) ? (
                      <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold text-xs tracking-wide flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Request Sent
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoin(flow.id)}
                        disabled={joiningId === flow.id}
                        className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs tracking-wide hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
                      >
                        {joiningId === flow.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            Request to Join <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                  </LiquidGlass>
                </motion.div>
              ))}

              <div className="bg-emerald-600 rounded-[40px] p-10 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/40">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
                <Plus className="w-12 h-12 text-white group-hover:rotate-90 transition-transform duration-500" />
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold tracking-tight">Publish a Flow</h3>
                  <p className="text-emerald-100/60 text-xs">Make your workflow public and invite participants.</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'service' && (
        <>
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setProviderCategory(null)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                !providerCategory 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                  : 'text-white/40 hover:text-white'
              }`}
            >
              All
            </button>
            {Object.entries(PROVIDER_CATEGORIES).map(([key, category]) => {
              const count = serviceProviders.filter(p => p.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setProviderCategory(key)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    providerCategory === key 
                      ? `bg-${category.color}-500/20 text-${category.color}-400 border border-${category.color}-500/30`
                      : 'text-white/40 hover:text-white'
                  }`}
                >
                  {category.label} ({count})
                </button>
              );
            })}
          </div>

          {providersLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin" />
            </div>
          ) : serviceProviders.length === 0 ? (
            <div className="text-center py-20">
              <Briefcase className="w-12 h-12 text-white/10 mx-auto mb-4" />
              <p className="text-white/30 text-sm">No service providers available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {serviceProviders
                .filter(provider => providerCategory === null || provider.category === providerCategory)
                .filter(provider => !searchQuery || provider.name.toLowerCase().includes(searchQuery.toLowerCase()))
                .map((provider, i) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <LiquidGlass className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-bold">{provider.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          provider.category === 'strategy' ? 'bg-blue-500/20 text-blue-400' :
                          provider.category === 'development' ? 'bg-emerald-500/20 text-emerald-400' :
                          'bg-purple-500/20 text-purple-400'
                        }`}>
                          {PROVIDER_CATEGORIES[provider.category as keyof typeof PROVIDER_CATEGORIES]?.label || provider.category}
                        </span>
                      </div>
                      <p className="text-sm text-white/40 line-clamp-3">{provider.description}</p>
                      <div className="space-y-2">
                        <a 
                          href={provider.website || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors block"
                        >
                          {provider.website || 'No website'}
                        </a>
                        <button
                          onClick={() => console.log('Apply to provider:', provider.id)}
                          className="w-full bg-white text-black rounded-2xl font-bold text-xs py-3 px-6 hover:bg-emerald-50 transition-all"
                        >
                          Apply
                        </button>
                      </div>
                    </LiquidGlass>
                  </motion.div>
                ))}
          </div>
        )}
        </>
      )}

      {activeTab === 'appStack' && (
        <>
          {Object.entries(
            participants
              .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .reduce((acc, participant) => {
                const role = participant.cantonRole || 'Unknown';
                if (!acc[role]) acc[role] = [];
                acc[role].push(participant);
                return acc;
              }, {} as Record<string, typeof participants>)
          )
            .sort(([, a], [, b]) => b.length - a.length)
            .slice(0, 5)
            .map(([role, roleParticipants]) => (
              <div key={role} className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-white">
                  {role} ({roleParticipants.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {roleParticipants.map((participant, i) => (
                    <motion.div
                      key={participant.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                    >
                      <LiquidGlass className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <h4 className="text-lg font-bold">{participant.name}</h4>
                          <span className="text-xs bg-blue-500/20 text-blue-400 rounded-full px-2 py-0.5">
                            {participant.cantonRole}
                          </span>
                        </div>
                        <p className="text-sm text-white/40 line-clamp-2">{participant.description}</p>
                        {participant.capabilities && Array.isArray(participant.capabilities) && (
                          <div className="flex flex-wrap gap-1">
                            {participant.capabilities.map((cap: string) => (
                              <span key={cap} className="bg-white/10 text-white/60 rounded px-2 py-0.5 text-xs">
                                {cap}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-4 text-xs">
                          {participant.holdings && (
                            <span className="text-emerald-400">{participant.holdings}</span>
                          )}
                          {participant.validatorNodes && participant.validatorNodes > 0 && (
                            <span className="text-amber-400">{participant.validatorNodes} nodes</span>
                          )}
                          {participant.superValidator && (
                            <span className="bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded">SuperValidator</span>
                          )}
                        </div>
                      </LiquidGlass>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
        </>
      )}
    </div>
  );
};
