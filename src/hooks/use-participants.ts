'use client';

import { useState, useEffect, useCallback } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/lib/swr-config';
import { participants as staticParticipants, workflows as staticWorkflows } from '@/lib/canton-data';
import type { Participant, Workflow } from '@/lib/canton-data';

interface DbParticipant {
  id: string;
  legacyId: string | null;
  name: string;
  description: string | null;
  logoUrl: string | null;
  website: string | null;
  cantonPartyId: string | null;
  roles: string[];
  capabilities: Record<string, number>;
  criticality: 'critical' | 'required' | 'optional';
  holdings: string | null;
  validatorNodes: number;
  superValidator: boolean;
  verificationStatus: 'unclaimed' | 'pending' | 'approved' | 'verified' | 'rejected';
  contactEmail: string | null;
  contactName: string | null;
  metadata: Record<string, unknown> | null;
}

function mapDbToCantonParticipant(p: DbParticipant): Participant {
  return {
    id: p.legacyId ?? p.id,
    name: p.name,
    cantonRole: Array.isArray(p.roles) ? p.roles.join(', ') : '',
    capabilities: p.capabilities ?? {},
    criticality: p.criticality?.toUpperCase() as Participant['criticality'] ?? 'OPTIONAL',
    description: p.description ?? undefined,
    logo: p.logoUrl ?? undefined,
    holdings: p.holdings ?? undefined,
    validatorNodes: p.validatorNodes ?? 0,
    superValidator: p.superValidator ?? false,
    hosted: false,
    isUser: false,
  };
}

interface UseParticipantsReturn {
  participants: Participant[];
  workflows: Workflow[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useParticipants(): UseParticipantsReturn {
  const { data: dbParticipants = [], isLoading, error: swrError } = useSWR(
    '/api/participants?limit=200&status=unclaimed&status=approved&status=verified',
    fetcher
  );

  const [participants, setParticipants] = useState<Participant[]>(staticParticipants);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dbParticipants && dbParticipants.length > 0) {
      setParticipants(dbParticipants.map(mapDbToCantonParticipant));
      setError(null);
    } else if (swrError) {
      setParticipants(staticParticipants);
      setError('Failed to fetch participants, using static data');
    } else if (!isLoading) {
      setParticipants(staticParticipants);
    }
  }, [dbParticipants, swrError, isLoading]);

  const refetch = useCallback(() => {
    // SWR will handle revalidation
  }, []);

  return {
    participants,
    workflows: staticWorkflows,
    isLoading,
    error,
    refetch,
  };
}
