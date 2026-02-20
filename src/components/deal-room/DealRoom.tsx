"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, PanelLeftClose, PanelLeft, ChevronRight, Settings } from 'lucide-react';
import { useDeal, useMessages, useSSE } from '@/hooks/use-deals';
import { useCantonAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/auth/rbac';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';
import DealSettings from './DealSettings';
import ParticipantManagement from './ParticipantManagement';
import FilesSidebar from './FilesSidebar';
import ActivityTimeline from './ActivityTimeline';

interface DealRoomProps {
  dealId: string;
}

const STAGES = [
  { key: 'draft',       label: 'Draft',       color: 'bg-white/40',    activeColor: 'bg-white/60' },
  { key: 'open',        label: 'Open',        color: 'bg-white/20', activeColor: 'bg-white/30' },
  { key: 'negotiating', label: 'Negotiate',   color: 'bg-white/20', activeColor: 'bg-white/30' },
  { key: 'locked',      label: 'Locked',      color: 'bg-white/20', activeColor: 'bg-white/30' },
  { key: 'committed',   label: 'Committed',   color: 'bg-white/40', activeColor: 'bg-white/60' },
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ['open'],
  open: ['negotiating'],
  negotiating: ['locked'],
  locked: ['committed'],
  committed: [],
};

export default function DealRoom({ dealId }: DealRoomProps) {
  const { user } = useCantonAuth();
  const { deal, participants, isLoading: dealLoading, refetch: refetchDeal } = useDeal(dealId);
  const { messages, isLoading: messagesLoading } = useMessages(dealId);
  const { isConnected, lastMessage } = useSSE(dealId);
  
  const [allMessages, setAllMessages] = useState(messages);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'files' | 'activity'>('details');
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (lastMessage) {
      setAllMessages(prev => [lastMessage, ...prev]);
    }
  }, [lastMessage]);

  useEffect(() => {
    setAllMessages(messages);
  }, [messages]);

  const handleStatusChange = async (newStatus: string) => {
    if (!user || !hasPermission(user.role, 'deal.status_change')) return;
    
    setIsTransitioning(true);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (res.ok) {
        await refetchDeal();
      }
    } catch (error) {
      console.error('Failed to update deal status:', error);
    } finally {
      setIsTransitioning(false);
    }
  };

  const currentStatus = deal?.status || 'draft';
  const currentStageIdx = STAGES.findIndex(s => s.key === currentStatus);
  const availableTransitions = STATUS_TRANSITIONS[currentStatus] || [];
  const canChangeStatus = user && hasPermission(user.role, 'deal.status_change');
  const nextStage = availableTransitions[0] ? STAGES.find(s => s.key === availableTransitions[0]) : null;

  if (dealLoading) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/30 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-sm">Deal not found</p>
          <button 
            onClick={() => { window.location.href = '/'; }}
            className="mt-3 px-4 py-1.5 bg-white/10 border border-white/10 text-white/60 rounded-lg font-bold text-[10px] tracking-wide hover:bg-white/15 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020202] flex flex-col">
      <div className="flex-shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="px-4 py-2.5 flex items-center gap-4">
          <button 
            onClick={() => { window.location.href = '/'; }}
            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-white truncate">{deal.title}</h1>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isConnected ? 'bg-white/70' : 'bg-white/30 animate-pulse'}`} />
            </div>
          </div>

          <div className="h-4 w-px bg-white/5 shrink-0" />

          <div className="flex items-center gap-0.5">
            {STAGES.map((stage, i) => {
              const isCompleted = i < currentStageIdx;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={stage.key} className="flex items-center gap-0.5">
                  {i > 0 && (
                    <div className={`w-5 h-px ${isCompleted ? 'bg-white/40' : 'bg-white/5'}`} />
                  )}
                  <div className="flex items-center gap-1.5 group relative">
                    <div className={`w-2 h-2 rounded-full transition-all ${
                      isCompleted ? 'bg-white/70'
                        : isCurrent ? stage.activeColor
                        : 'bg-white/10'
                    }`} />
                    <span className={`text-[8px] font-bold tracking-wide hidden md:inline ${
                      isCurrent ? 'text-white/70' : isCompleted ? 'text-white/60' : 'text-white/15'
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => setSettingsOpen(true)}
              className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
            
            {canChangeStatus && nextStage && (
              <button
                onClick={() => handleStatusChange(nextStage.key)}
                disabled={isTransitioning}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/30 text-white rounded text-[9px] font-bold tracking-wide hover:border-white/50 transition-all disabled:opacity-50"
              >
                {isTransitioning ? (
                  <div className="w-3 h-3 border border-black/20 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    {nextStage.label}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {!isConnected && !dealLoading && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 bg-yellow-500/5 border-b border-yellow-500/10 px-4 py-1.5 flex items-center justify-center gap-2"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/60 animate-pulse" />
            <span className="text-[10px] text-yellow-500/60 font-mono">Reconnecting to live feed...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex min-h-0">
        <motion.div
          animate={{ width: sidebarOpen ? 280 : 48 }}
          transition={{ duration: 0.2, ease: "easeInOut" }}
          className="flex-shrink-0 border-r border-white/5 bg-[#050505] flex flex-col"
        >
          {!sidebarOpen ? (
            <div className="flex flex-col items-center pt-3 gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2.5 text-white/40 hover:text-white/70 hover:bg-white/5 rounded-lg transition-colors"
              >
                <PanelLeft className="w-4 h-4" />
              </button>
              <div className="flex flex-col items-center gap-1.5">
                {participants.slice(0, 5).map(p => (
                  <div
                    key={p.id}
                    className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                    title={p.displayName || p.partyId || 'Unknown'}
                  >
                    <span className="text-[7px] font-bold text-white/50">
                      {(p.displayName || p.partyId || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                ))}
                {participants.length > 5 && (
                  <span className="text-[7px] text-white/20">+{participants.length - 5}</span>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 pt-3 pb-3 flex items-center justify-between border-b border-white/5">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`text-[9px] font-bold tracking-wide px-2 py-1 rounded transition-colors ${
                      activeTab === 'details' 
                        ? 'text-white/70 bg-white/5' 
                        : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    DETAILS
                  </button>
                  <button
                    onClick={() => setActiveTab('files')}
                    className={`text-[9px] font-bold tracking-wide px-2 py-1 rounded transition-colors ${
                      activeTab === 'files' 
                        ? 'text-white/70 bg-white/5' 
                        : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    FILES
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className={`text-[9px] font-bold tracking-wide px-2 py-1 rounded transition-colors ${
                      activeTab === 'activity' 
                        ? 'text-white/70 bg-white/5' 
                        : 'text-white/30 hover:text-white/50'
                    }`}
                  >
                    ACTIVITY
                  </button>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-1 text-white/40 hover:text-white/70 hover:bg-white/5 rounded transition-colors"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex-1 overflow-hidden">
                {activeTab === 'details' && (
                  <div className="h-full overflow-y-auto p-4 space-y-4">
                    <div className="space-y-2.5">
                      {deal.volume && (
                        <div>
                          <p className="text-[8px] text-white/30 tracking-wide mb-0.5">VOLUME</p>
                          <p className="text-xs font-bold text-white/80">{deal.volume}</p>
                        </div>
                      )}
                      {deal.description && (
                        <div>
                          <p className="text-[8px] text-white/30 tracking-wide mb-0.5">DESCRIPTION</p>
                          <p className="text-[11px] text-white/60 leading-relaxed">{deal.description}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-[8px] text-white/30 tracking-wide mb-0.5">CREATED</p>
                        <p className="text-[11px] text-white/50">{new Date(deal.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="h-px bg-white/5" />

                    <ParticipantManagement 
                      participants={participants}
                      dealId={dealId}
                      onUpdate={refetchDeal}
                      currentUserRole={participants.find(p => p.userId === user?.id)?.role || null}
                    />
                  </div>
                )}

                {activeTab === 'files' && (
                  <FilesSidebar 
                    messages={allMessages}
                    dealId={dealId}
                    onFileUploaded={() => window.location.reload()}
                  />
                )}

                {activeTab === 'activity' && (
                  <ActivityTimeline 
                    messages={allMessages}
                    deal={{
                      createdAt: deal.createdAt,
                      status: deal.status || 'draft',
                      title: deal.title
                    }}
                  />
                )}
              </div>
            </>
          )}
        </motion.div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 min-h-0">
            <MessageThread 
              messages={allMessages}
              isLoading={messagesLoading}
              dealId={dealId}
              isConnected={isConnected}
            />
          </div>
          
          <div className="flex-shrink-0 border-t border-white/5">
            <MessageInput dealId={dealId} />
          </div>
        </div>
      </div>

      {deal && (
        <DealSettings 
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          deal={deal}
          onUpdate={refetchDeal}
          dealId={dealId}
        />
      )}
    </div>
  );
}