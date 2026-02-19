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
} from 'lucide-react';
import { useCantonAuth } from '@/lib/auth-context';

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
          <h2 className="text-4xl font-bold uppercase tracking-tighter text-emerald-500">Marketplace</h2>
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
                className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all ${!selectedType ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-white/40 hover:text-white'}`}
              >
                ALL
              </button>
              {workflowTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-bold tracking-widest transition-all uppercase ${selectedType === type ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' : 'text-white/40 hover:text-white'}`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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
              className="bg-[#0a0a0a] border border-white/10 rounded-[40px] p-10 space-y-8 hover:border-emerald-500 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                <Workflow className="w-16 h-16" />
              </div>
              
              <div className="space-y-4 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/10 rounded-lg">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  </div>
                  {flow.workflowType && (
                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">{flow.workflowType}</span>
                  )}
                </div>
                <h3 className="text-2xl font-bold uppercase tracking-tighter leading-tight">{flow.title}</h3>
                {flow.description && (
                  <p className="text-sm text-white/40 leading-relaxed font-medium lowercase tracking-tight line-clamp-2">{flow.description}</p>
                )}
              </div>

              <div className="space-y-4 relative z-10 pt-4 border-t border-white/5">
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-white/20">Created by</span>
                  <span className="text-white/80">{flow.creatorDisplayName ?? 'Unknown'}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest">
                  <span className="text-white/20">Published</span>
                  <span className="text-white/60">{new Date(flow.createdAt).toLocaleDateString()}</span>
                </div>
                
                {isOwnFlow(flow) ? (
                  <div className="w-full py-4 bg-white/5 text-white/30 rounded-2xl font-bold text-xs uppercase tracking-widest text-center">
                    Your Flow
                  </div>
                ) : joinedIds.has(flow.id) ? (
                  <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Request Sent
                  </div>
                ) : (
                  <button
                    onClick={() => handleJoin(flow.id)}
                    disabled={joiningId === flow.id}
                    className="w-full py-4 bg-white text-black rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center gap-2 group/btn disabled:opacity-50"
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
            </motion.div>
          ))}

          <div className="bg-emerald-600 rounded-[40px] p-10 flex flex-col justify-center items-center text-center space-y-6 relative overflow-hidden group cursor-pointer shadow-xl shadow-emerald-900/40">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full" />
            <Plus className="w-12 h-12 text-white group-hover:rotate-90 transition-transform duration-500" />
            <div className="space-y-2">
              <h3 className="text-2xl font-bold uppercase tracking-tighter">Publish a Flow</h3>
              <p className="text-emerald-100/60 text-xs">Make your workflow public and invite participants.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
