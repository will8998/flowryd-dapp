'use client';

import { useState, useEffect, useCallback } from 'react';

interface Flow {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  isTemplate: boolean | null;
  isPublic: boolean | null;
  workflowType: string | null;
  isFeatured: boolean | null;
  featuredHeadline: string | null;
  featuredSource: string | null;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

interface FlowSections {
  inflight: Flow[];
  production: Flow[];
  inTheNews: Flow[];
  templates: Flow[];
}

export function useFlowSections() {
  const [sections, setSections] = useState<FlowSections>({
    inflight: [],
    production: [],
    inTheNews: [],
    templates: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/flows/sections');
      if (res.ok) {
        const json = await res.json();
        setSections({
          inflight: json.data?.inflight ?? [],
          production: json.data?.production ?? [],
          inTheNews: json.data?.inTheNews ?? [],
          templates: json.data?.templates ?? [],
        });
      }
    } catch {
      console.error('Failed to fetch flow sections');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  return { sections, isLoading, refetch: fetchSections };
}

export function useFlowFeatured(flowId: string | null) {
  const setFeatured = useCallback(
    async (data: { isFeatured: boolean; featuredHeadline?: string; featuredSource?: string }) => {
      if (!flowId) return null;
      const res = await fetch(`/api/flows/${flowId}/featured`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.flow ?? null;
      }
      return null;
    },
    [flowId],
  );

  return { setFeatured };
}
