'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import useSWR from 'swr';
import { authFetch } from '@/lib/auth-fetch';
import { useSocket } from '@/hooks/use-socket';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  volume: string | null;
  flowId: string | null;
  archivedAt: string | null;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

interface DealParticipant {
  id: string;
  userId: string;
  role: string | null;
  joinedAt: string | null;
  displayName: string | null;
  partyId: string | null;
}

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
  deletedAt?: string | null;
  reactions?: { emoji: string; count: number; users: string[] }[];
}

export function useDeals(includeArchived = false) {
  const { data: deals = [], isLoading, mutate } = useSWR<Deal[]>(`/api/deals${includeArchived ? '?includeArchived=true' : ''}`);

  return { deals, isLoading, refetch: mutate };
}

export function useDeal(dealId: string | null) {
  const [deal, setDeal] = useState<Deal | null>(null);
  const [participants, setParticipants] = useState<DealParticipant[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchDeal = useCallback(async () => {
    if (!dealId) return;
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/deals/${dealId}`);
      if (res.ok) {
        const json = await res.json();
        setDeal(json.data?.deal ?? null);
        setParticipants(json.data?.participants ?? []);
      }
    } catch {
      console.error('Failed to fetch deal');
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchDeal();
  }, [fetchDeal]);

  return { deal, participants, isLoading, refetch: fetchDeal };
}

export function useMessages(dealId: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messageIdsRef = useRef<Set<string>>(new Set());

  const fetchMessages = useCallback(async () => {
    if (!dealId) return;
    try {
      setIsLoading(true);
      const res = await authFetch(`/api/deals/${dealId}/messages`);
      if (res.ok) {
        const json = await res.json();
        const fetched: Message[] = json.data ?? [];
        // Rebuild the dedup set from fetched messages
        messageIdsRef.current = new Set(fetched.map(m => m.id));
        setMessages(fetched);
      }
    } catch {
      console.error('Failed to fetch messages');
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Add a single message with dedup — used by both sendMessage and SSE
  const addMessage = useCallback((msg: Message) => {
    if (messageIdsRef.current.has(msg.id)) return; // deduplicate
    messageIdsRef.current.add(msg.id);
    setMessages(prev => [msg, ...prev]);
  }, []);

  const sendMessage = useCallback(
    async (content: string, threadId?: string) => {
      if (!dealId) return null;
      const res = await authFetch(`/api/deals/${dealId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, threadId, contentType: 'text' }),
      });
      if (res.ok) {
        const json = await res.json();
        const newMsg = json.data?.message;
        if (newMsg) {
          addMessage(newMsg);
        }
        return newMsg;
      }
      return null;
    },
    [dealId, addMessage],
  );

  return { messages, isLoading, sendMessage, addMessage, refetch: fetchMessages };
}

export interface TypingUser {
  userId: string;
  displayName: string;
  isTyping: boolean;
}

export interface PresenceUser {
  userId: string;
  displayName: string;
  status: 'online' | 'offline';
}

export function useSSE(dealId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);
  const [typingUsers, setTypingUsers] = useState<Map<string, TypingUser>>(new Map());
  const [onlineUsers, setOnlineUsers] = useState<Map<string, string>>(new Map());
  const [editedMessages, setEditedMessages] = useState<Map<string, { content: string; isEdited: boolean; editedAt: string }>>(new Map());
  const [deletedMessageIds, setDeletedMessageIds] = useState<Set<string>>(new Set());
  const [messageReactions, setMessageReactions] = useState<Map<string, { emoji: string; count: number; users: string[] }[]>>(new Map());
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { socket, isConnected: socketConnected } = useSocket();

  useEffect(() => {
    if (!dealId || !socket) {
      setIsConnected(false);
      return;
    }

    // Join the deal room
    socket.emit('join-deal', dealId);
    setIsConnected(socketConnected);

    // Listen for messages
    const handleMessage = (data: Message) => {
      setLastMessage(data);
    };

    // Listen for typing events
    const handleTyping = (data: TypingUser) => {
      if (data.isTyping) {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.set(data.userId, data);
          return next;
        });

        // Auto-clear typing after 4s (in case stop event is missed)
        const existing = typingTimersRef.current.get(data.userId);
        if (existing) clearTimeout(existing);
        typingTimersRef.current.set(data.userId, setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Map(prev);
            next.delete(data.userId);
            return next;
          });
          typingTimersRef.current.delete(data.userId);
        }, 4000));
      } else {
        setTypingUsers(prev => {
          const next = new Map(prev);
          next.delete(data.userId);
          return next;
        });
        const existing = typingTimersRef.current.get(data.userId);
        if (existing) {
          clearTimeout(existing);
          typingTimersRef.current.delete(data.userId);
        }
      }
    };

    // Listen for presence events
    const handlePresence = (data: PresenceUser) => {
      setOnlineUsers(prev => {
        const next = new Map(prev);
        if (data.status === 'online') {
          next.set(data.userId, data.displayName);
        } else {
          next.delete(data.userId);
        }
        return next;
      });
    };

    // Listen for message edit events
    const handleMessageEdit = (data: { messageId: string; content: string; isEdited: boolean; editedAt: string }) => {
      setEditedMessages(prev => {
        const next = new Map(prev);
        next.set(data.messageId, { content: data.content, isEdited: data.isEdited, editedAt: data.editedAt });
        return next;
      });
    };

    // Listen for message delete events
    const handleMessageDelete = (data: { messageId: string }) => {
      setDeletedMessageIds(prev => {
        const next = new Set(prev);
        next.add(data.messageId);
        return next;
      });
    };

    // Listen for message reaction events
    const handleMessageReact = (data: { messageId: string; reactions: { emoji: string; count: number; users: string[] }[]; userId: string; emoji: string; action: 'add'|'remove' }) => {
      setMessageReactions(prev => {
        const next = new Map(prev);
        next.set(data.messageId, data.reactions);
        return next;
      });
    };

    // Listen for message read events
    const handleMessageRead = (data: { messageId: string; userId: string; readAt: string }) => {
      // For now, we'll just log this - read receipts can be implemented later
      console.log('Message read:', data);
    };

    socket.on('message', handleMessage);
    socket.on('typing', handleTyping);
    socket.on('presence', handlePresence);
    socket.on('message:edit', handleMessageEdit);
    socket.on('message:delete', handleMessageDelete);
    socket.on('message:react', handleMessageReact);
    socket.on('message:read', handleMessageRead);

    return () => {
      // Leave the deal room
      socket.emit('leave-deal', dealId);
      socket.off('message', handleMessage);
      socket.off('typing', handleTyping);
      socket.off('presence', handlePresence);
      socket.off('message:edit', handleMessageEdit);
      socket.off('message:delete', handleMessageDelete);
      socket.off('message:react', handleMessageReact);
      socket.off('message:read', handleMessageRead);
      // Clear all typing timers
      typingTimersRef.current.forEach(t => clearTimeout(t));
      typingTimersRef.current.clear();
      setIsConnected(false);
    };
  }, [dealId, socket, socketConnected]);

  return {
    isConnected,
    lastMessage,
    typingUsers: Array.from(typingUsers.values()),
    onlineUsers: Array.from(onlineUsers.entries()).map(([userId, displayName]) => ({ userId, displayName })),
    editedMessages,
    deletedMessageIds,
    messageReactions,
  };
}

/** Debounced typing indicator sender */
export function useTypingIndicator(dealId: string | null) {
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const { socket } = useSocket();

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!dealId || !socket) return;
    socket.emit('typing', { dealId, isTyping, displayName: '' });
  }, [dealId, socket]);

  const onKeystroke = useCallback(() => {
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      sendTyping(true);
    }

    // Reset the stop timer
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      sendTyping(false);
    }, 2500);
  }, [sendTyping]);

  const stopTyping = useCallback(() => {
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      sendTyping(false);
    }
  }, [sendTyping]);

  return { onKeystroke, stopTyping };
}

export function useUnreadCount(dealId: string | null) {
  const { data, mutate } = useSWR(
    dealId ? `/api/deals/${dealId}/read-receipts` : null,
    (url) => authFetch(url).then(r => r.json()).then(d => d.unreadCount ?? 0),
    { refreshInterval: 30000 }
  );
  return { unreadCount: data ?? 0, refreshUnread: mutate };
}

export function useMarkRead(dealId: string | null) {
  const markRead = useCallback(async (messageIds: string[]) => {
    if (!dealId || messageIds.length === 0) return;
    await authFetch(`/api/deals/${dealId}/read-receipts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageIds }),
    });
  }, [dealId]);
  return { markRead };
}