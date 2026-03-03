'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { authFetch } from '@/lib/auth-fetch';

interface Deal {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  volume: string | null;
  flowId: string | null;
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
}

export function useDeals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDeals = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await authFetch('/api/deals');
      if (res.ok) {
        const json = await res.json();
        setDeals(json.data ?? []);
      }
    } catch {
      console.error('Failed to fetch deals');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return { deals, isLoading, refetch: fetchDeals };
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
  const typingTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    if (!dealId) return;

    let eventSource: EventSource | null = null;
    let retryCount = 0;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      eventSource = new EventSource(`/api/deals/${dealId}/messages/stream`);

      eventSource.addEventListener('connected', () => {
        retryCount = 0;
        if (isMounted) setIsConnected(true);
      });

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          if (isMounted) setLastMessage(data);
        } catch {}
      });

      eventSource.addEventListener('typing', (event) => {
        try {
          const data: TypingUser = JSON.parse(event.data);
          if (!isMounted) return;

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
              if (!isMounted) return;
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
        } catch {}
      });

      eventSource.addEventListener('presence', (event) => {
        try {
          const data: PresenceUser = JSON.parse(event.data);
          if (!isMounted) return;

          setOnlineUsers(prev => {
            const next = new Map(prev);
            if (data.status === 'online') {
              next.set(data.userId, data.displayName);
            } else {
              next.delete(data.userId);
            }
            return next;
          });
        } catch {}
      });

      eventSource.onerror = () => {
        eventSource?.close();
        if (!isMounted) return;
        retryCount++;
        if (retryCount >= 3) setIsConnected(false);
        const delay = Math.min(2000 * Math.pow(1.5, retryCount - 1), 30000);
        reconnectTimer = setTimeout(connect, delay);
      };
    };

    connect();

    return () => {
      isMounted = false;
      eventSource?.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      // Clear all typing timers
      typingTimersRef.current.forEach(t => clearTimeout(t));
      typingTimersRef.current.clear();
      setIsConnected(false);
    };
  }, [dealId]);

  return {
    isConnected,
    lastMessage,
    typingUsers: Array.from(typingUsers.values()),
    onlineUsers: Array.from(onlineUsers.entries()).map(([userId, displayName]) => ({ userId, displayName })),
  };
}

/** Debounced typing indicator sender */
export function useTypingIndicator(dealId: string | null) {
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);

  const sendTyping = useCallback(async (isTyping: boolean) => {
    if (!dealId) return;
    try {
      await fetch(`/api/deals/${dealId}/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isTyping }),
      });
    } catch {}
  }, [dealId]);

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