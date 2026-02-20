'use client';

import { useState, useEffect, useCallback } from 'react';
import { participants as staticParticipants, workflows as staticWorkflows } from '@/lib/canton-data';
import type { Participant, Workflow } from '@/lib/canton-data';

interface Provider {
  id: string;
  name: string;
  category: string;
  description: string | null;
  website: string | null;
  contactEmail: string | null;
  logoUrl: string | null;
  status: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

interface ProvidersResponse {
  data: {
    providers: Provider[];
    total: number;
  };
}

interface FlowParticipantsState {
  participants: Participant[];
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
}

const mapCategoryToCantonRole = (category: string): string => {
  switch (category.toLowerCase()) {
    case 'strategy':
      return 'Strategy Consulting';
    case 'development':
      return 'Infrastructure Development';
    case 'creative':
      return 'Creative Services';
    default:
      return category;
  }
};

const mapStatusToCriticality = (status: string | null): 'CRITICAL' | 'REQUIRED' | 'OPTIONAL' => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'REQUIRED';
    case 'pending':
      return 'OPTIONAL';
    case 'inactive':
      return 'OPTIONAL';
    default:
      return 'OPTIONAL';
  }
};

const transformProviderToParticipant = (provider: Provider): Participant => {
  const metadata = provider.metadata || {};
  return {
    id: provider.id,
    name: provider.name,
    cantonRole: mapCategoryToCantonRole(provider.category),
    capabilities: { [provider.category]: 1 },
    criticality: mapStatusToCriticality(provider.status),
    description: provider.description || undefined,
    logo: provider.logoUrl || undefined,
    holdings: typeof metadata.holdings === 'string' ? metadata.holdings : undefined,
    validatorNodes: typeof metadata.validatorNodes === 'number' ? metadata.validatorNodes : 0,
    superValidator: typeof metadata.superValidator === 'boolean' ? metadata.superValidator : false,
    hosted: typeof metadata.hosted === 'boolean' ? metadata.hosted : false,
    isUser: false,
  };
};

export function useFlowParticipants(): FlowParticipantsState {
  const [participants, setParticipants] = useState<Participant[]>(staticParticipants);
  const [workflows] = useState<Workflow[]>(staticWorkflows);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch('/api/admin/providers?limit=100');
      
      if (res.ok) {
        const json: ProvidersResponse = await res.json();
        const providers = json.data?.providers ?? [];
        
        if (providers.length > 0) {
          const transformedParticipants = providers.map(transformProviderToParticipant);
          setParticipants(transformedParticipants);
        } else {
          setParticipants(staticParticipants);
        }
      } else {
        setParticipants(staticParticipants);
        setError('Failed to fetch providers, using static data');
      }
    } catch (err) {
      console.error('Failed to fetch participants:', err);
      setParticipants(staticParticipants);
      setError('Network error, using static data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParticipants();
  }, [fetchParticipants]);

  return {
    participants,
    workflows,
    isLoading,
    error,
  };
}