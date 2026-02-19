'use client';

import { useState, useEffect, useCallback } from 'react';

interface Provider {
  id: string;
  name: string;
  category: string;
  description: string | null;
  website: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  status: string | null;
  createdAt: string;
}

interface ProviderApplication {
  id: string;
  providerId: string;
  orgId: string;
  userId: string;
  message: string | null;
  status: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
}

export function useProviders(category?: string) {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = category ? `?category=${category}` : '';
      const res = await fetch(`/api/providers${params}`);
      if (res.ok) {
        const json = await res.json();
        setProviders(json.data?.providers ?? []);
      }
    } catch {
      console.error('Failed to fetch providers');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchProviders();
  }, [fetchProviders]);

  const createProvider = useCallback(
    async (data: { name: string; category: string; description?: string; website?: string; contactEmail?: string }) => {
      const res = await fetch('/api/providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        const newProvider = json.data?.provider ?? null;
        if (newProvider) {
          setProviders(prev => [...prev, newProvider]);
        }
        return newProvider;
      }
      return null;
    },
    [],
  );

  return { providers, isLoading, createProvider, refetch: fetchProviders };
}

export function useProviderApplications(providerId: string | null) {
  const [applications, setApplications] = useState<ProviderApplication[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchApplications = useCallback(async () => {
    if (!providerId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/providers/${providerId}/applications`);
      if (res.ok) {
        const json = await res.json();
        setApplications(json.data?.applications ?? []);
      }
    } catch {
      console.error('Failed to fetch applications');
    } finally {
      setIsLoading(false);
    }
  }, [providerId]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const applyToProvider = useCallback(
    async (message?: string) => {
      if (!providerId) return null;
      const res = await fetch(`/api/providers/${providerId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.application ?? null;
      }
      return null;
    },
    [providerId],
  );

  const reviewApplication = useCallback(
    async (applicationId: string, status: 'approved' | 'rejected') => {
      if (!providerId) return null;
      const res = await fetch(`/api/providers/${providerId}/applications?applicationId=${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        const json = await res.json();
        const updated = json.data?.application ?? null;
        if (updated) {
          setApplications(prev => prev.map(app => app.id === applicationId ? updated : app));
        }
        return updated;
      }
      return null;
    },
    [providerId],
  );

  return { applications, isLoading, applyToProvider, reviewApplication, refetch: fetchApplications };
}
