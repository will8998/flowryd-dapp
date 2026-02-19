"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Circle } from 'lucide-react';
import { useDeal, useMessages, useSSE } from '@/hooks/use-deals';
import { useCantonAuth } from '@/lib/auth-context';
import { hasPermission } from '@/lib/auth/rbac';
import MessageThread from './MessageThread';
import MessageInput from './MessageInput';

interface DealRoomProps {
  dealId: string;
}

const DEAL_STATUS_CONFIG = {
  draft: { color: 'bg-white/40', label: 'DRAFT' },
  open: { color: 'bg-blue-500', label: 'OPEN' },
  negotiating: { color: 'bg-yellow-500', label: 'NEGOTIATING' },
  locked: { color: 'bg-orange-500', label: 'LOCKED' },
  committed: { color: 'bg-emerald-500', label: 'COMMITTED' },
};

const STATUS_TRANSITIONS = {
  draft: ['open'],
  open: ['negotiating'],
  negotiating: ['locked'],
  locked: ['committed'],
  committed: [],
};

export default function DealRoom({ dealId }: DealRoomProps) {
  const { user } = useCantonAuth();
  const { deal, participants, isLoading: dealLoading, refetch: refetchDeal } = useDeal(dealId);
  const { messages, isLoading: messagesLoading, refetch: refetchMessages } = useMessages(dealId);
  const { isConnected, lastMessage } = useSSE(dealId);
  
  const [allMessages, setAllMessages] = useState(messages);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleBack = () => {
    window.location.href = '/';
  };

  const currentStatus = deal?.status || 'draft';
  const statusConfig = DEAL_STATUS_CONFIG[currentStatus as keyof typeof DEAL_STATUS_CONFIG] || DEAL_STATUS_CONFIG.draft;
  const availableTransitions = STATUS_TRANSITIONS[currentStatus as keyof typeof STATUS_TRANSITIONS] || [];
  const canChangeStatus = user && hasPermission(user.role, 'deal.status_change');

  if (dealLoading) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="h-screen bg-[#020202] flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 text-lg">Deal not found</p>
          <button 
            onClick={handleBack}
            className="mt-4 px-6 py-2 bg-emerald-500 text-black rounded-xl font-bold text-sm hover:bg-emerald-400 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#020202] flex flex-col">
      {/* Status Bar */}
      <div className="flex-shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{deal.title}</h1>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex items-center gap-1.5 px-2 py-1 bg-white/5 border border-white/10 rounded-full">
                  <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.color} ${isConnected ? 'animate-pulse' : ''}`} />
                  <span className="text-[10px] font-bold text-white/60 tracking-widest">{statusConfig.label}</span>
                </div>
                <div className="flex items-center gap-1 text-white/40">
                  <Circle className="w-3 h-3" />
                  <span className="text-[10px] font-bold tracking-widest">
                    {isConnected ? 'CONNECTED' : 'RECONNECTING...'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Transition Buttons */}
          {canChangeStatus && availableTransitions.length > 0 && (
            <div className="flex gap-2">
              {availableTransitions.map(status => {
                const transitionConfig = DEAL_STATUS_CONFIG[status as keyof typeof DEAL_STATUS_CONFIG];
                return (
                  <button
                    key={status}
                    onClick={() => handleStatusChange(status)}
                    disabled={isTransitioning}
                    className="px-4 py-2 bg-white text-black rounded-lg font-bold text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${transitionConfig.color}`} />
                    {transitionConfig.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* Left Sidebar */}
        <div className="flex-shrink-0 w-80 border-r border-white/5 bg-black/20 p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            {/* Deal Info */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-4">
              <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest mb-3">Deal Overview</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest">Volume</p>
                  <p className="text-sm font-bold text-white">{deal.volume || '—'}</p>
                </div>
                {deal.description && (
                  <div>
                    <p className="text-[9px] text-white/40 uppercase tracking-widest">Description</p>
                    <p className="text-xs text-white/80 leading-relaxed">{deal.description}</p>
                  </div>
                )}
                <div>
                  <p className="text-[9px] text-white/40 uppercase tracking-widest">Created</p>
                  <p className="text-xs text-white/60">{new Date(deal.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="bg-[#0a0a0a] border border-white/10 rounded-[20px] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-emerald-500" />
                <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-widest">Participants</h3>
                <span className="text-[9px] text-white/40 ml-auto">({participants.length})</span>
              </div>
              <div className="space-y-2">
                {participants.map(participant => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-emerald-400">
                        {(participant.displayName || participant.partyId || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-white truncate">
                        {participant.displayName || participant.partyId || 'Unknown'}
                      </p>
                      {participant.role && (
                        <p className="text-[9px] text-white/40 uppercase tracking-widest">
                          {participant.role}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Messages */}
          <div className="flex-1 min-h-0">
            <MessageThread 
              messages={allMessages}
              isLoading={messagesLoading}
              dealId={dealId}
            />
          </div>
          
          {/* Message Input */}
          <div className="flex-shrink-0 border-t border-white/5 bg-black/40 backdrop-blur-md">
            <MessageInput dealId={dealId} />
          </div>
        </div>
      </div>
    </div>
  );
}