'use client';

import React, { useState, useMemo } from 'react';
import { Megaphone } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { intelAnnouncements, type IntelAnnouncement } from '@/lib/canton-intel-data';

interface IntelAnnouncementsViewProps {
  onSelectAnnouncement?: (announcement: IntelAnnouncement) => void;
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const impactBadgeVariant = (impact: string) => {
  switch (impact) {
    case 'Critical': return 'danger' as const;
    case 'High': return 'warning' as const;
    case 'Medium': return 'info' as const;
    case 'Low': return 'default' as const;
    default: return 'default' as const;
  }
};

const typeBadgeVariant = (type: string) => {
  switch (type) {
    case 'Product Launch': return 'success' as const;
    case 'Investment': return 'warning' as const;
    case 'Corporate Rebrand': return 'info' as const;
    case 'Featured App Approved': return 'success' as const;
    case 'Featured App Submission': return 'default' as const;
    default: return 'default' as const;
  }
};

export default function IntelAnnouncementsView({ onSelectAnnouncement }: IntelAnnouncementsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let data = [...intelAnnouncements];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(a =>
        a.description.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.participants.some(p => p.toLowerCase().includes(q)) ||
        a.impact.toLowerCase().includes(q)
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
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (announcement: IntelAnnouncement) => (
        <div className="flex items-center gap-2">
          <Megaphone className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
          <span className="text-white/60 text-xs font-mono">
            {formatDate(announcement.date)}
          </span>
        </div>
      ),
    },
    {
      key: 'participants',
      label: 'Participants',
      sortable: true,
      render: (announcement: IntelAnnouncement) => (
        <span className="text-white/60 text-xs">
          {announcement.participants.join(', ')}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (announcement: IntelAnnouncement) => (
        <Badge variant={typeBadgeVariant(announcement.type)}>{announcement.type}</Badge>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      sortable: true,
      render: (announcement: IntelAnnouncement) => (
        <span className="text-white/90 text-xs">{announcement.description}</span>
      ),
    },
    {
      key: 'impact',
      label: 'Impact',
      sortable: true,
      render: (announcement: IntelAnnouncement) => (
        <Badge variant={impactBadgeVariant(announcement.impact)}>
          {announcement.impact}
        </Badge>
      ),
    },
    {
      key: 'sourceUrl',
      label: 'Source',
      render: (announcement: IntelAnnouncement) => (
        <span className="text-xs">
          {announcement.sourceUrl ? (
            <a 
              href={announcement.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Link
            </a>
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
        searchPlaceholder="Search announcements..."
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
        getRowId={(a) => a.id}
        onRowClick={onSelectAnnouncement}
      />
    </div>
  );
}