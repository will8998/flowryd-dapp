'use client';

import React, { useState, useMemo } from 'react';
import { User } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { intelPeople, type IntelPerson, getOrgById } from '@/lib/canton-intel-data';

interface IntelPeopleViewProps {
  onSelectPerson?: (person: IntelPerson) => void;
}

const priorityVariant = (p: string) => {
  switch (p) {
    case 'High': return 'warning' as const;
    case 'Medium': return 'info' as const;
    default: return 'default' as const;
  }
};

const relationshipVariant = (r: string) => {
  switch (r) {
    case 'Partner': return 'success' as const;
    case 'Connected': return 'info' as const;
    case 'Warm': return 'warning' as const;
    default: return 'default' as const;
  }
};

export default function IntelPeopleView({ onSelectPerson }: IntelPeopleViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('priority');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filteredData = useMemo(() => {
    let data = [...intelPeople];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(p => {
        const org = getOrgById(p.organizationId);
        return (
          p.fullName.toLowerCase().includes(q) ||
          p.currentRole.toLowerCase().includes(q) ||
          (org?.name ?? '').toLowerCase().includes(q)
        );
      });
    }
    const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    data.sort((a, b) => {
      if (sortBy === 'priority') {
        const cmp = (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3);
        return sortDir === 'asc' ? cmp : -cmp;
      }
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      const cmp = String(aVal ?? '').localeCompare(String(bVal ?? ''));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [searchQuery, sortBy, sortDir]);

  const columns = [
    {
      key: 'fullName',
      label: 'Name',
      sortable: true,
      render: (person: IntelPerson) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-white/40" />
          </div>
          <div>
            <div className="font-medium text-white/90 text-xs">{person.fullName}</div>
            <div className="text-[9px] text-white/30 font-mono">{person.currentRole}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'organizationId',
      label: 'Organization',
      sortable: true,
      render: (person: IntelPerson) => {
        const org = getOrgById(person.organizationId);
        return (
          <span className="text-white/60 text-xs">{org?.name ?? 'Unknown'}</span>
        );
      },
    },
    {
      key: 'cantonRoles',
      label: 'Canton Roles',
      render: (person: IntelPerson) => (
        <div className="flex flex-wrap gap-1">
          {person.cantonRoles.map(role => (
            <span key={role} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
              {role}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (person: IntelPerson) => (
        <Badge variant={priorityVariant(person.priority)}>{person.priority}</Badge>
      ),
    },
    {
      key: 'relationshipToFlowryd',
      label: 'Relationship',
      sortable: true,
      render: (person: IntelPerson) => (
        <Badge variant={relationshipVariant(person.relationshipToFlowryd)}>
          {person.relationshipToFlowryd}
        </Badge>
      ),
    },
    {
      key: 'eventIds',
      label: 'Events',
      render: (person: IntelPerson) => (
        <span className="text-white/40 text-xs font-mono">{person.eventIds.length}</span>
      ),
    },
    {
      key: 'mediaIds',
      label: 'Media',
      render: (person: IntelPerson) => (
        <span className="text-white/40 text-xs font-mono">{person.mediaIds.length}</span>
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <DataTable
        columns={columns}
        data={filteredData}
        searchable
        searchPlaceholder="Search people..."
        onSearch={setSearchQuery}
        sortBy={sortBy}
        sortDir={sortDir}
        onSort={(col) => {
          if (col === sortBy) {
            setSortDir(d => d === 'asc' ? 'desc' : 'asc');
          } else {
            setSortBy(col);
            setSortDir('asc');
          }
        }}
        getRowId={(p) => p.id}
        onRowClick={onSelectPerson}
      />
    </div>
  );
}
