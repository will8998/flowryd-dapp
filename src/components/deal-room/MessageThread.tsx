"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, Clock, MoreHorizontal } from 'lucide-react';

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

interface MessageThreadProps {
  messages: Message[];
  isLoading: boolean;
  dealId: string;
}

interface GroupedMessages {
  parentMessage: Message;
  replies: Message[];
}

export default function MessageThread({ messages, isLoading, dealId }: MessageThreadProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const loadMoreMessages = async () => {
    if (!cursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/messages?cursor=${cursor}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        const newMessages = json.data || [];
        setCursor(json.cursor);
        setHasMore(json.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const groupMessages = (messages: Message[]): GroupedMessages[] => {
    const groups: GroupedMessages[] = [];
    const threadsMap = new Map<string, Message[]>();
    const parentMessages: Message[] = [];

    messages.forEach(message => {
      if (message.threadId) {
        if (!threadsMap.has(message.threadId)) {
          threadsMap.set(message.threadId, []);
        }
        threadsMap.get(message.threadId)!.push(message);
      } else {
        parentMessages.push(message);
      }
    });

    parentMessages.forEach(parent => {
      groups.push({
        parentMessage: parent,
        replies: threadsMap.get(parent.id) || []
      });
    });

    return groups.sort((a, b) => 
      new Date(a.parentMessage.createdAt).getTime() - new Date(b.parentMessage.createdAt).getTime()
    );
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current && shouldScrollToBottom) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);
    }
  };

  const MessageBubble: React.FC<{ message: Message; isReply?: boolean }> = ({ message, isReply = false }) => {
    const avatar = (message.senderDisplayName || message.senderPartyId || 'U')[0].toUpperCase();
    const isFile = message.contentType === 'file' && message.fileUrl;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${isReply ? 'ml-6 mt-2' : 'mb-4'}`}
      >
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <span className="text-[10px] font-bold text-blue-400">{avatar}</span>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-xs font-medium text-white">
              {message.senderDisplayName || message.senderPartyId || 'Unknown'}
            </p>
            <div className="flex items-center gap-1 text-white/40">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">{formatTimestamp(message.createdAt)}</span>
            </div>
            {message.isEdited && (
              <span className="text-[9px] text-white/30 italic">edited</span>
            )}
          </div>
          
          {isFile ? (
            <div className="bg-[#0a0a0a] border border-white/10 rounded-lg p-3 max-w-sm">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {message.fileName || 'Unknown file'}
                  </p>
                  {message.fileSize && (
                    <p className="text-[10px] text-white/40">
                      {formatFileSize(message.fileSize)}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
                  className="w-6 h-6 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Download className="w-3 h-3" />
                </button>
              </div>
              {message.content && message.content.trim() && (
                <p className="text-sm text-white/80 mt-2 leading-relaxed">
                  {message.content}
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">
              {message.content}
            </p>
          )}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="flex gap-2">
                  <div className="h-3 bg-white/10 rounded w-20" />
                  <div className="h-3 bg-white/10 rounded w-16" />
                </div>
                <div className="h-4 bg-white/10 rounded w-3/4" />
                <div className="h-4 bg-white/10 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const groupedMessages = groupMessages(messages);

  return (
    <div className="h-full flex flex-col">
      <div 
        ref={scrollAreaRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 custom-scrollbar"
      >
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-[10px] font-bold text-white/60 uppercase tracking-widest hover:bg-white/10 transition-all disabled:opacity-50"
            >
              {loadingMore ? (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 border border-white/20 border-t-transparent rounded-full animate-spin" />
                  Loading...
                </div>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
        
        {groupedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                <MoreHorizontal className="w-6 h-6 text-white/30" />
              </div>
              <p className="text-white/40 text-sm">No messages yet</p>
              <p className="text-white/20 text-xs mt-1">Start the conversation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {groupedMessages.map(group => (
              <div key={group.parentMessage.id} className="mb-6">
                <MessageBubble message={group.parentMessage} />
                {group.replies.length > 0 && (
                  <div className="ml-4 border-l border-white/10 pl-4">
                    {group.replies
                      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                      .map(reply => (
                        <MessageBubble key={reply.id} message={reply} isReply />
                      ))}
                  </div>
                )}
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}