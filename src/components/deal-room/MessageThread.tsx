"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, MessageCircle } from 'lucide-react';

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
  if (isToday) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const groupMessages = (messages: Message[]): GroupedMessages[] => {
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

  return parentMessages
    .map(parent => ({
      parentMessage: parent,
      replies: threadsMap.get(parent.id) || [],
    }))
    .sort((a, b) =>
      new Date(a.parentMessage.createdAt).getTime() - new Date(b.parentMessage.createdAt).getTime()
    );
};

const MessageBubble: React.FC<{ message: Message; isReply?: boolean }> = ({ message, isReply = false }) => {
  const avatar = (message.senderDisplayName || message.senderPartyId || 'U')[0].toUpperCase();
  const isFile = message.contentType === 'file' && message.fileUrl;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isReply ? 'ml-5 mt-1.5' : 'mb-3'}`}
    >
      <div className="w-7 h-7 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <span className="text-[9px] font-bold text-blue-400">{avatar}</span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="text-[11px] font-semibold text-white/80">
            {message.senderDisplayName || message.senderPartyId || 'Unknown'}
          </span>
          <span className="text-[9px] text-white/20">{formatTimestamp(message.createdAt)}</span>
          {message.isEdited && (
            <span className="text-[8px] text-white/15 italic">edited</span>
          )}
        </div>

        {isFile ? (
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-2.5 max-w-xs mt-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-white/80 truncate">
                  {message.fileName || 'Unknown file'}
                </p>
                {message.fileSize && (
                  <p className="text-[9px] text-white/30">{formatFileSize(message.fileSize)}</p>
                )}
              </div>
              <button
                onClick={() => message.fileUrl && window.open(message.fileUrl, '_blank')}
                className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center text-white/40 hover:text-white/70 hover:bg-white/10 transition-all shrink-0"
              >
                <Download className="w-3 h-3" />
              </button>
            </div>
            {message.content && message.content.trim() && (
              <p className="text-[12px] text-white/70 mt-1.5 leading-relaxed">{message.content}</p>
            )}
          </div>
        ) : (
          <p className="text-[13px] text-white/70 leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default function MessageThread({ messages, isLoading, dealId }: MessageThreadProps) {
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);

  const loadMoreMessages = async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/messages?cursor=${cursor}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        setCursor(json.cursor);
        setHasMore(json.hasMore || false);
      }
    } catch (error) {
      console.error('Failed to load more messages:', error);
    } finally {
      setLoadingMore(false);
    }
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
      setShouldScrollToBottom(scrollHeight - scrollTop - clientHeight < 100);
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex gap-2.5 animate-pulse">
              <div className="w-7 h-7 rounded-full bg-white/5" />
              <div className="flex-1 space-y-1.5">
                <div className="flex gap-2">
                  <div className="h-3 bg-white/5 rounded w-16" />
                  <div className="h-3 bg-white/5 rounded w-12" />
                </div>
                <div className="h-3.5 bg-white/5 rounded w-3/4" />
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
        className="flex-1 overflow-y-auto px-4 py-3"
      >
        {hasMore && (
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-white/5" />
            <button
              onClick={loadMoreMessages}
              disabled={loadingMore}
              className="text-[9px] font-bold text-white/25 tracking-wide hover:text-white/40 transition-colors disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 border border-white/20 border-t-transparent rounded-full animate-spin" />
                  Loading
                </span>
              ) : (
                'Load older'
              )}
            </button>
            <div className="flex-1 h-px bg-white/5" />
          </div>
        )}

        {groupedMessages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-5 h-5 text-white/15" />
              </div>
              <p className="text-[12px] text-white/30">No messages yet</p>
              <p className="text-[10px] text-white/15 mt-0.5">Type below to start the conversation</p>
            </div>
          </div>
        ) : (
          <AnimatePresence>
            {groupedMessages.map(group => (
              <div key={group.parentMessage.id} className="mb-4">
                <MessageBubble message={group.parentMessage} />
                {group.replies.length > 0 && (
                  <div className="ml-3 border-l border-white/5 pl-3">
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