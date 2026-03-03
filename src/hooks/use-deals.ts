'use client';

import { useState, useEffect, useCallback } from 'react';
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
      const res = await fetch(`/api/deals/${dealId}`);
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

  const fetchMessages = useCallback(async () => {
    if (!dealId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/deals/${dealId}/messages`);
      if (res.ok) {
        const json = await res.json();
        setMessages(json.data ?? []);
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

  const sendMessage = useCallback(
    async (content: string, threadId?: string) => {
      if (!dealId) return null;
      const res = await fetch(`/api/deals/${dealId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, threadId, contentType: 'text' }),
      });
      if (res.ok) {
        const json = await res.json();
        const newMsg = json.data?.message;
        if (newMsg) {
          setMessages(prev => [newMsg, ...prev]);
        }
        return newMsg;
      }
      return null;
    },
    [dealId],
  );

  return { messages, isLoading, sendMessage, refetch: fetchMessages };
}

export function useSSE(dealId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!dealId) return;

    let eventSource: EventSource | null = null;

    const connect = () => {
      eventSource = new EventSource(`/api/deals/${dealId}/messages/stream`);

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('message', (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch {}
      });

      eventSource.onerror = () => {
        setIsConnected(false);
        eventSource?.close();
        setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      eventSource?.close();
      setIsConnected(false);
    };
  }, [dealId]);

  return { isConnected, lastMessage };
}
