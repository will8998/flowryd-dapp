"use client";

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Plus, 
  MessageCircle, 
  Settings, 
  ChevronRight,
  Activity,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  dealId: string;
  threadId: string | null;
  senderId: string;
  content: string;
  contentType: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileSize: number | null;
  isEdited: boolean | null;
  createdAt: string;
  senderDisplayName: string | null;
  senderPartyId: string | null;
}

interface Deal {
  createdAt: string;
  status: string;
  title: string;
}

interface ActivityTimelineProps {
  messages: Message[];
  deal: Deal;
}

interface TimelineEvent {
  id: string;
  type: 'deal_created' | 'status_change' | 'file_upload' | 'message' | 'system';
  title: string;
  description: string;
  timestamp: string;
  icon: React.ComponentType<{ className?: string }>;
  user?: string;
  color: string;
}

const STAGES = [
  { key: 'draft', label: 'Draft' },
  { key: 'open', label: 'Open' },
  { key: 'negotiating', label: 'Negotiate' },
  { key: 'locked', label: 'Locked' },
  { key: 'committed', label: 'Committed' },
];

export default function ActivityTimeline({ messages, deal }: ActivityTimelineProps) {
  const events = useMemo(() => {
    const timelineEvents: TimelineEvent[] = [];

    timelineEvents.push({
      id: 'deal-created',
      type: 'deal_created',
      title: 'Deal Created',
      description: `"${deal.title}" was created`,
      timestamp: deal.createdAt,
      icon: Plus,
      color: 'text-green-400',
    });

    messages.forEach((message) => {
      if (message.contentType === 'system' || message.content.startsWith('[System]')) {
        const statusMatch = message.content.match(/status.*changed.*to\s+(\w+)/i);
        if (statusMatch) {
          const newStatus = statusMatch[1];
          const stage = STAGES.find(s => s.key === newStatus);
          timelineEvents.push({
            id: `status-${message.id}`,
            type: 'status_change',
            title: 'Status Updated',
            description: `Deal moved to ${stage?.label || newStatus}`,
            timestamp: message.createdAt,
            icon: ChevronRight,
            user: message.senderDisplayName || message.senderPartyId || undefined,
            color: 'text-blue-400',
          });
        } else {
          timelineEvents.push({
            id: `system-${message.id}`,
            type: 'system',
            title: 'System Event',
            description: message.content.replace(/^\[System\]\s*/, ''),
            timestamp: message.createdAt,
            icon: Settings,
            color: 'text-yellow-400',
          });
        }
      }
      else if (message.contentType === 'file' || message.fileUrl) {
        timelineEvents.push({
          id: `file-${message.id}`,
          type: 'file_upload',
          title: 'File Uploaded',
          description: `${message.fileName || 'Unknown file'} was shared`,
          timestamp: message.createdAt,
          icon: Paperclip,
          user: message.senderDisplayName || message.senderPartyId || undefined,
          color: 'text-purple-400',
        });
      }
      else if (message.content && message.content.length > 50) {
        timelineEvents.push({
          id: `message-${message.id}`,
          type: 'message',
          title: 'Message',
          description: message.content.slice(0, 80) + (message.content.length > 80 ? '...' : ''),
          timestamp: message.createdAt,
          icon: MessageCircle,
          user: message.senderDisplayName || message.senderPartyId || undefined,
          color: 'text-white/60',
        });
      }
    });

    return timelineEvents
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 50);
  }, [messages, deal]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return diffInMinutes < 1 ? 'just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        {events.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded bg-white/[0.02] border border-white/5 flex items-center justify-center mx-auto mb-3">
                <Activity className="w-5 h-5 text-white/20" />
              </div>
              <p className="text-[11px] text-white/30">No activity yet</p>
              <p className="text-[9px] text-white/15 mt-0.5">Activity will appear as the deal progresses</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
            
            <div className="space-y-0">
              {events.map((event, index) => {
                const Icon = event.icon;
                
                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex items-start gap-3 pb-4"
                  >
                    <div className="relative z-10">
                      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                        <Icon className={`w-3.5 h-3.5 ${event.color}`} />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <h4 className="text-[11px] font-bold text-white/80">{event.title}</h4>
                        <span className="text-[8px] text-white/20 shrink-0">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-[10px] text-white/60 leading-relaxed mb-0.5">
                        {event.description}
                      </p>
                      
                      {event.user && (
                        <p className="text-[8px] text-white/30 font-mono tracking-wide">
                          by {event.user}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}