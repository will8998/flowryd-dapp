'use client';

import { useState, useEffect, useCallback } from 'react';

interface Plan {
  id: string;
  name: string;
  tier: string;
  priceAmount: number;
  priceCurrency: string | null;
  interval: string;
  features: string[];
  isActive: boolean | null;
}

interface Subscription {
  id: string;
  orgId: string;
  planId: string;
  status: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelledAt: string | null;
  trialEndsAt: string | null;
  createdAt: string;
  plan?: Plan;
}

interface Invoice {
  id: string;
  orgId: string;
  subscriptionId: string;
  amountDue: number;
  currency: string | null;
  status: string | null;
  paidAt: string | null;
  dueDate: string;
  createdAt: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/plans');
      if (res.ok) {
        const json = await res.json();
        setPlans(json.data?.plans ?? []);
      }
    } catch {
      console.error('Failed to fetch plans');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return { plans, isLoading, refetch: fetchPlans };
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSubscription = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/subscriptions');
      if (res.ok) {
        const json = await res.json();
        setSubscription(json.data?.subscription ?? null);
      }
    } catch {
      console.error('Failed to fetch subscription');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const createSubscription = useCallback(
    async (data: { planId: string; paymentMethodId?: string }) => {
      const res = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        const newSub = json.data?.subscription ?? null;
        setSubscription(newSub);
        return newSub;
      }
      return null;
    },
    [],
  );

  const cancelSubscription = useCallback(
    async (subscriptionId: string, reason?: string) => {
      const res = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data?.subscription ?? null;
        setSubscription(updated);
        return updated;
      }
      return null;
    },
    [],
  );

  return { subscription, isLoading, createSubscription, cancelSubscription, refetch: fetchSubscription };
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/subscriptions/invoices');
      if (res.ok) {
        const json = await res.json();
        setInvoices(json.data ?? []);
      }
    } catch {
      console.error('Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  return { invoices, isLoading, refetch: fetchInvoices };
}
