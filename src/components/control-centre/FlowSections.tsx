"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, Factory, Newspaper, LayoutTemplate, Loader2, Workflow } from 'lucide-react';
import { useFlowSections } from '@/hooks/use-flow-sections';
import { LiquidGlass } from './LiquidPrimitives';

interface SectionFlow {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  isTemplate: boolean | null;
  isPublic: boolean | null;
  workflowType: string | null;
  isFeatured: boolean | null;
  featuredHeadline: string | null;
  featuredSource: string | null;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

export const FlowSections: React.FC = () => {
  const { sections, isLoading } = useFlowSections();
  const [activeTab, setActiveTab] = useState<'inflight' | 'production' | 'inTheNews' | 'templates'>('inflight');

  const tabs = [
    { 
      key: 'inflight' as const, 
      label: 'Inflight', 
      icon: Radio, 
      count: sections?.inflight?.length || 0 
    },
    { 
      key: 'production' as const, 
      label: 'Production', 
      icon: Factory, 
      count: sections?.production?.length || 0 
    },
    { 
      key: 'inTheNews' as const, 
      label: 'In The News', 
      icon: Newspaper, 
      count: sections?.inTheNews?.length || 0 
    },
    { 
      key: 'templates' as const, 
      label: 'Templates', 
      icon: LayoutTemplate, 
      count: sections?.templates?.length || 0 
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-emerald-500';
      case 'draft': return 'bg-amber-500';
      case 'archived': return 'bg-white/20';
      default: return 'bg-white/20';
    }
  };

  const renderFlowCard = (flow: SectionFlow, index: number) => (
    <motion.div
      key={flow.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <LiquidGlass className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white mb-2">{flow.title}</h3>
            <p className="text-sm text-white/40 line-clamp-2 mb-3">{flow.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusColor(flow.status ?? '')}`} />
          </div>
        </div>

        {flow.workflowType && (
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-medium">
            {flow.workflowType}
          </div>
        )}

        {activeTab === 'inTheNews' && flow.featuredHeadline && (
          <div className="space-y-1">
            <p className="text-sm text-amber-400 italic">{flow.featuredHeadline}</p>
            {flow.featuredSource && (
              <p className="text-xs text-white/30">{flow.featuredSource}</p>
            )}
          </div>
        )}

        {activeTab === 'templates' && (
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 text-xs font-medium">
            Template
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-white/30">
          <span>Updated {formatDate(flow.updatedAt)}</span>
          {flow.createdBy && <span>by {flow.createdBy}</span>}
        </div>
      </LiquidGlass>
    </motion.div>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      );
    }

    const activeFlows = sections?.[activeTab] || [];

    if (activeFlows.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-white/30">
          <Workflow className="w-16 h-16 mb-4" />
          <p className="text-lg">No flows in this section</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {activeFlows.map((flow: SectionFlow, index: number) => renderFlowCard(flow, index))}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-[#020202] text-white">
      <div className="p-8 border-b border-white/5">
        <div className="flex items-center gap-3 mb-2">
          <Workflow className="w-6 h-6 text-blue-500" />
          <h1 className="text-2xl font-bold">Flows Studio</h1>
        </div>
        <p className="text-white/40">Browse your workflow library</p>
      </div>

      <div className="p-8 pb-0">
        <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 text-xs rounded-full
                  ${isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-white/10 text-white/30'}
                `}>
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};