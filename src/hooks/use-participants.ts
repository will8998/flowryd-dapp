'use client';

import { useState, useEffect, useCallback } from 'react';
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
  const [participants, setParticipants] = useState<Participant[]>(staticParticipants);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParticipants = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch('/api/participants?limit=200&status=unclaimed&status=approved&status=verified');

      if (res.ok) {
        const json = await res.json();
        const dbParticipants: DbParticipant[] = json.data?.participants ?? [];

        if (dbParticipants.length > 0) {
          setParticipants(dbParticipants.map(mapDbToCantonParticipant));
        } else {
          setParticipants(staticParticipants);
        }
      } else {
        setParticipants(staticParticipants);
        setError('Failed to fetch participants, using static data');
      }
    } catch {
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
    workflows: staticWorkflows,
    isLoading,
    error,
    refetch: fetchParticipants,
  };
}
