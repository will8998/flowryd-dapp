'use client';

import React, { useState, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { intelEvents, type IntelEvent, getPeopleForEvent } from '@/lib/canton-intel-data';

interface IntelEventsViewProps {
  onSelectEvent?: (event: IntelEvent) => void;
}

const formatDateRange = (start: string, end: string): string => {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleDateString('en-US', { month: 'short' });
  const startDay = s.getDate();
  const endDay = e.getDate();
  const year = s.getFullYear();
  if (s.getMonth() === e.getMonth()) {
    return `${month} ${startDay}-${endDay}, ${year}`;
  }
  const endMonth = e.toLocaleDateString('en-US', { month: 'short' });
  return `${month} ${startDay} - ${endMonth} ${endDay}, ${year}`;
};

const relevanceBadgeVariant = (r: string) => {
  switch (r) {
    case 'High': return 'warning' as const;
    case 'Medium': return 'info' as const;
    default: return 'default' as const;
  }
};

const typeBadgeVariant = (t: string) => {
  switch (t) {
    case 'Conference': return 'info' as const;
    case 'Summit': return 'warning' as const;
    case 'Hackathon': return 'success' as const;
    default: return 'default' as const;
  }
};

export default function IntelEventsView({ onSelectEvent }: IntelEventsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let data = [...intelEvents];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(e =>
        e.name.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
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
      key: 'name',
      label: 'Event',
      sortable: true,
      render: (event: IntelEvent) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
          <span className="font-medium text-white/90 text-xs">{event.name}</span>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (event: IntelEvent) => (
        <Badge variant={typeBadgeVariant(event.type)}>{event.type}</Badge>
      ),
    },
    {
      key: 'startDate',
      label: 'Dates',
      sortable: true,
      render: (event: IntelEvent) => (
        <span className="text-white/60 text-xs font-mono">
          {formatDateRange(event.startDate, event.endDate)}
        </span>
      ),
    },
    {
      key: 'location',
      label: 'Location',
      sortable: true,
      render: (event: IntelEvent) => (
        <span className="text-white/60 text-xs">{event.location}</span>
      ),
    },
    {
      key: 'cantonRelevance',
      label: 'Relevance',
      sortable: true,
      render: (event: IntelEvent) => (
        <Badge variant={relevanceBadgeVariant(event.cantonRelevance)}>
          {event.cantonRelevance}
        </Badge>
      ),
    },
    {
      key: 'speakers',
      label: 'Speakers',
      render: (event: IntelEvent) => {
        const people = getPeopleForEvent(event.id);
        return (
          <span className="text-white/40 text-xs font-mono">{people.length}</span>
        );
      },
    },
    {
      key: 'flowrydAttended',
      label: 'Flowryd',
      render: (event: IntelEvent) => (
        <span className="text-xs">
          {event.flowrydAttended ? (
            <Badge variant="success">Attended</Badge>
          ) : event.flowrydSpeaking ? (
            <Badge variant="warning">Speaking</Badge>
          ) : (
            <span className="text-white/20 font-mono text-[9px]">—</span>
          )}
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
        searchPlaceholder="Search events..."
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
        getRowId={(e) => e.id}
        onRowClick={onSelectEvent}
      />
    </div>
  );
}
