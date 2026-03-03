"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileText, MessageCircle, Eye, Clock } from 'lucide-react';
import { templateParticipants } from '@/lib/canton-templates-data';

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
  isConnected?: boolean;
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
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  if (diffInHours < 24) return `${diffInHours}h`;
  if (diffInDays < 7) return `${diffInDays}d`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const getMessageTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const getSenderOrganization = (message: Message) => {
  // Try to find organization from templateParticipants data
  const orgData = templateParticipants.find(tp => 
    tp.participantId === message.senderPartyId ||
    tp.organization.toLowerCase().includes((message.senderDisplayName || '').toLowerCase())
  );
  return orgData?.organization || null;
};

const getSenderRole = (message: Message) => {
  const orgData = templateParticipants.find(tp => 
    tp.participantId === message.senderPartyId ||
    tp.organization.toLowerCase().includes((message.senderDisplayName || '').toLowerCase())
  );
  return orgData?.cantonRole || null;
};

const getSeenByCount = (_messageId: string) => {
  // TODO: Wire to real read receipts when implemented
  return 0;
};

const _shouldGroupMessages = (current: Message, previous: Message) => {
  if (!previous) return false;
  if (current.senderId !== previous.senderId) return false;
  if (current.contentType === 'system' || previous.contentType === 'system') return false;
  
  const currentTime = new Date(current.createdAt).getTime();
  const previousTime = new Date(previous.createdAt).getTime();
  const timeDifference = currentTime - previousTime;
  
  // Group if within 5 minutes
  return timeDifference < 5 * 60 * 1000;
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

const renderMessageContent = (content: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = content.split(urlRegex);
  
  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/30 hover:decoration-blue-300/50 transition-colors"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const isImageFile = (fileName: string | null) => {
  if (!fileName) return false;
  const ext = fileName.split('.').pop()?.toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(ext || '');
};

const MessageBubble: React.FC<{ 
  message: Message; 
  isReply?: boolean; 
  isGrouped?: boolean; 
  showTimestamp?: boolean; 
}> = ({ message, isReply = false, isGrouped = false, showTimestamp: _showTimestamp = true }) => {
  const avatar = (message.senderDisplayName || message.senderPartyId || 'U')[0].toUpperCase();
  const organization = getSenderOrganization(message);
  const senderRole = getSenderRole(message);
  const seenCount = getSeenByCount(message.id);
  const isFile = message.contentType === 'file' || message.fileUrl;
  const isSystem = message.contentType === 'system' || message.content.startsWith('[System]');
  const isImageFileMessage = isFile && isImageFile(message.fileName);

  if (isSystem) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="flex justify-center mb-4"
      >
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-full">
          <Clock className="w-3 h-3 text-white/30" />
          <p className="text-[10px] text-white/40 font-mono">{getMessageTime(message.createdAt)}</p>
          <p className="text-[10px] text-white/40 italic">
            {message.content.replace(/^\[System\]\s*/, '')}
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`relative group ${isReply ? 'ml-6 mt-1' : 'mb-4'} ${isGrouped ? 'mt-1' : ''}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className={`shrink-0 transition-all duration-200 ${isGrouped ? 'opacity-30 scale-90' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/20 flex items-center justify-center group-hover:border-white/30 transition-all">
            <span className="text-[10px] font-bold text-white/70">{avatar}</span>
          </div>
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header - only show for non-grouped messages */}
          {!isGrouped && (
            <div className="flex items-center gap-2 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-semibold text-white/90">
                  {message.senderDisplayName || message.senderPartyId || 'Unknown'}
                </span>
                
                {/* Organization Badge */}
                {organization && (
                  <span className="text-[9px] text-white/50 bg-white/5 px-1.5 py-0.5 rounded font-mono">
                    {organization}
                  </span>
                )}
                
                {/* Role Badge */}
                {senderRole && (
                  <span className="text-[8px] font-bold tracking-wide px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                    {senderRole.split(',')[0].trim()}
                  </span>
                )}
              </div>
              
              {/* Timestamp and Status */}
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-[9px] text-white/25 font-mono group-hover:text-white/40 transition-colors">
                  {formatTimestamp(message.createdAt)}
                </span>
                
                {/* Seen indicator */}
                {seenCount > 0 && (
                  <div className="flex items-center gap-1 text-[8px] text-white/20 group-hover:text-white/30 transition-colors">
                    <Eye className="w-2.5 h-2.5" />
                    <span>{seenCount}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Message Body */}
          {isFile && message.fileUrl && message.fileName ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3 max-w-sm hover:bg-white/[0.03] hover:border-white/[0.08] transition-all group-hover:shadow-lg group-hover:shadow-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-white/90 truncate">
                    {message.fileName}
                  </p>
                  {message.fileSize && (
                    <p className="text-[9px] text-white/40 mt-0.5">{formatFileSize(message.fileSize)}</p>
                  )}
                </div>
                <button
                  onClick={() => window.open(message.fileUrl!, '_blank')}
                  className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-white/80 hover:bg-white/15 hover:border-white/20 transition-all shrink-0"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {isImageFileMessage && (
                <div className="mt-3">
                  <img
                    src={message.fileUrl}
                    alt={message.fileName}
                    className="w-full h-auto max-h-64 rounded-lg border border-white/10 object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              
              {message.content && message.content.trim() && (
                <div className="text-[13px] text-white/80 mt-3 leading-relaxed border-t border-white/5 pt-2">
                  {renderMessageContent(message.content)}
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-[13px] text-white/80 leading-relaxed whitespace-pre-wrap">
              {renderMessageContent(message.content)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default function MessageThread({ messages, isLoading, dealId, isConnected }: MessageThreadProps) {
  const [olderMessages, setOlderMessages] = useState<Message[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const [showNewMsgButton, setShowNewMsgButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  // Combine messages from initial fetch + older loaded messages (deduped)
  const allMessages = React.useMemo(() => {
    const seen = new Set(messages.map(m => m.id));
    const extras = olderMessages.filter(m => !seen.has(m.id));
    return [...messages, ...extras];
  }, [messages, olderMessages]);

  const loadMoreMessages = async () => {
    if (loadingMore || !hasMore) return;
    // Use the oldest message's ID as cursor
    const oldestMsg = allMessages[allMessages.length - 1];
    if (!oldestMsg) return;
    setLoadingMore(true);
    try {
      const res = await fetch(`/api/deals/${dealId}/messages?cursor=${oldestMsg.id}&limit=50`);
      if (res.ok) {
        const json = await res.json();
        const older: Message[] = json.data ?? [];
        if (older.length > 0) {
          setOlderMessages(prev => [...prev, ...older]);
        }
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    scrollToBottom();
  }, [allMessages]);

  useEffect(() => {
    if (isNearBottom && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    } else if (!isNearBottom && allMessages.length > 0) {
      setShowNewMsgButton(true);
    }
  }, [allMessages.length, isNearBottom]);

  const handleScroll = () => {
    if (scrollAreaRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current;
      const nearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setIsNearBottom(nearBottom);
      setShouldScrollToBottom(nearBottom);
      
      if (!nearBottom && !showNewMsgButton) {
        setShowNewMsgButton(true);
      } else if (nearBottom && showNewMsgButton) {
        setShowNewMsgButton(false);
      }
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

  const groupedMessages = groupMessages(allMessages);

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
              <div className="w-12 h-12 rounded bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mx-auto mb-3">
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

        {isConnected && messages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1 flex items-center justify-center"
          >
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" />
              <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1 h-1 rounded-full bg-white/20 animate-pulse" style={{ animationDelay: '0.4s' }} />
              <span className="text-[8px] text-white/20 font-mono ml-2">Live</span>
            </div>
          </motion.div>
        )}
      </div>

      {showNewMsgButton && !isNearBottom && (
        <button
          onClick={() => {
            if (scrollAreaRef.current) {
              scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
              setShowNewMsgButton(false);
            }
          }}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-[10px] text-white/60 font-mono hover:bg-white/15 transition-colors z-20 backdrop-blur-sm"
        >
          New messages ↓
        </button>
      )}
    </div>
  );
}