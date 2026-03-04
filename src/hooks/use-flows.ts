'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr-config';

export interface Flow {
  id: string;
  title: string;
  description: string | null;
  status: string | null;
  isTemplate: boolean | null;
  isPublic: boolean | null;
  workflowType: string | null;
  createdBy: string;
  updatedAt: string;
  createdAt: string;
}

interface FlowVersion {
  id: string;
  flowId: string;
  version: number;
  nodes: unknown[];
  edges: unknown[];
  viewport: { x: number; y: number; zoom: number } | null;
  snapshotName: string | null;
  createdAt: string;
}

export function useFlows() {
  const { data: flows = [], isLoading, mutate } = useSWR<Flow[]>('/api/flows', fetcher);

  return { flows, isLoading, refetch: mutate };
}

export function useFlow(flowId: string | null) {
  const [flow, setFlow] = useState<Flow | null>(null);
  const [version, setVersion] = useState<FlowVersion | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchFlow = useCallback(async () => {
    if (!flowId) return;
    try {
      setIsLoading(true);
      const res = await fetch(`/api/flows/${flowId}`);
      if (res.ok) {
        const json = await res.json();
        setFlow(json.data?.flow ?? null);
        setVersion(json.data?.version ?? null);
      }
    } catch {
      console.error('Failed to fetch flow');
    } finally {
      setIsLoading(false);
    }
  }, [flowId]);

  useEffect(() => {
    fetchFlow();
  }, [fetchFlow]);

  const saveVersion = useCallback(
    async (nodes: unknown[], edges: unknown[], viewport?: { x: number; y: number; zoom: number }) => {
      if (!flowId) return null;
      const res = await fetch(`/api/flows/${flowId}/versions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, viewport }),
      });
      if (res.ok) {
        const json = await res.json();
        setVersion(json.data?.version ?? null);
        return json.data?.version;
      }
      return null;
    },
    [flowId],
  );

  const createFlow = useCallback(
    async (data: { title: string; description?: string; workflowType?: string }) => {
      const res = await fetch('/api/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data?.flow;
      }
      return null;
    },
    [],
  );

  return { flow, version, isLoading, saveVersion, createFlow, refetch: fetchFlow };
}
