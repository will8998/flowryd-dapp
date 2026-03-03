'use client';

import React, { useState, useMemo } from 'react';
import { ScrollText } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { cipRegistry, type CIPRecord } from '@/lib/canton-intel-data';

interface IntelCIPViewProps {
  onSelectCIP?: (cip: CIPRecord) => void;
}

const statusBadgeVariant = (status: string) => {
  switch (status) {
    case 'Approved': return 'success' as const;
    case 'Active': return 'info' as const;
    case 'Pending': return 'warning' as const;
    case 'Rejected': return 'danger' as const;
    default: return 'default' as const;
  }
};

const typeBadgeVariant = (type: string) => {
  switch (type) {
    case 'Super Validator': return 'warning' as const;
    case 'Protocol Upgrade': return 'info' as const;
    case 'Governance': return 'success' as const;
    case 'Network Parameter': return 'default' as const;
    default: return 'default' as const;
  }
};

export default function IntelCIPView({ onSelectCIP }: IntelCIPViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('cipNumber');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let data = [...cipRegistry];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(c =>
        c.cipNumber.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.proposer.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q)
      );
    }
    data.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [searchQuery, sortBy, sortDir]);

  const columns = [
    {
      key: 'cipNumber',
      label: 'CIP Number',
      sortable: true,
      render: (cip: CIPRecord) => (
        <div className="flex items-center gap-2">
          <ScrollText className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
          <span className="font-medium text-white/90 text-xs font-mono">{cip.cipNumber}</span>
        </div>
      ),
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (cip: CIPRecord) => (
        <span className="text-white/90 text-xs">{cip.title}</span>
      ),
    },
    {
      key: 'proposer',
      label: 'Proposer',
      sortable: true,
      render: (cip: CIPRecord) => (
        <span className="text-white/60 text-xs">{cip.proposer}</span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (cip: CIPRecord) => (
        <Badge variant={typeBadgeVariant(cip.type)}>{cip.type}</Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (cip: CIPRecord) => (
        <Badge variant={statusBadgeVariant(cip.status)}>
          {cip.status}
        </Badge>
      ),
    },
    {
      key: 'voteResult',
      label: 'Vote Result',
      sortable: true,
      render: (cip: CIPRecord) => (
        <span className="text-white/60 text-xs font-mono">
          {cip.voteResult || <span className="text-white/20 font-mono text-[9px]">—</span>}
        </span>
      ),
    },
    {
      key: 'svWeightRequested',
      label: 'SV Weight',
      sortable: true,
      render: (cip: CIPRecord) => (
        <span className="text-white/60 text-xs font-mono">
          {cip.svWeightRequested !== undefined ? cip.svWeightRequested : <span className="text-white/20 font-mono text-[9px]">—</span>}
        </span>
      ),
    },
    {
      key: 'ccDistributed',
      label: 'CC Distributed',
      sortable: true,
      render: (cip: CIPRecord) => (
        <span className="text-white/60 text-xs font-mono">
          {cip.ccDistributed !== undefined ? cip.ccDistributed : <span className="text-white/20 font-mono text-[9px]">—</span>}
        </span>
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <DataTable
        columns={columns}
        data={filteredData}
        searchable
        searchPlaceholder="Search CIPs..."
        onSearch={setSearchQuery}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={(col) => {
          if (col === sortBy) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(col);
            setSortDir('desc');
          }
        }}
        getRowId={(c) => c.cipNumber}
        onRowClick={onSelectCIP}
      />
    </div>
  );
}