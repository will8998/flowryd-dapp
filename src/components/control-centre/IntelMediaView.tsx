'use client';

import React, { useState, useMemo } from 'react';
import { Newspaper, Mic, Video, FileText, BookOpen, Radio } from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { Badge } from '@/components/ui/Badge';
import { intelMedia, type IntelMedia, getPersonById } from '@/lib/canton-intel-data';

interface IntelMediaViewProps {
  onSelectMedia?: (media: IntelMedia) => void;
}

const mediaTypeIcon = (type: string) => {
  switch (type) {
    case 'Podcast': return <Mic className="w-3.5 h-3.5 text-purple-400/60" />;
    case 'Interview': return <Radio className="w-3.5 h-3.5 text-blue-400/60" />;
    case 'Webinar': return <Video className="w-3.5 h-3.5 text-cyan-400/60" />;
    case 'Article': return <FileText className="w-3.5 h-3.5 text-emerald-400/60" />;
    case 'Research Report': return <BookOpen className="w-3.5 h-3.5 text-amber-400/60" />;
    case 'Video': return <Video className="w-3.5 h-3.5 text-red-400/60" />;
    default: return <Newspaper className="w-3.5 h-3.5 text-white/40" />;
  }
};

const sentimentVariant = (s: string) => {
  switch (s) {
    case 'Bullish': return 'success' as const;
    case 'Bearish': return 'danger' as const;
    default: return 'default' as const;
  }
};

const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function IntelMediaView({ onSelectMedia }: IntelMediaViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('publicationDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredData = useMemo(() => {
    let data = [...intelMedia];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(m =>
        m.title.toLowerCase().includes(q) ||
        m.publisher.toLowerCase().includes(q) ||
        m.mediaType.toLowerCase().includes(q)
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
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (media: IntelMedia) => (
        <div className="flex items-center gap-2 max-w-xs">
          {mediaTypeIcon(media.mediaType)}
          <span className="font-medium text-white/90 text-xs truncate">{media.title}</span>
        </div>
      ),
    },
    {
      key: 'mediaType',
      label: 'Type',
      sortable: true,
      render: (media: IntelMedia) => (
        <Badge variant="default">{media.mediaType}</Badge>
      ),
    },
    {
      key: 'publisher',
      label: 'Publisher',
      sortable: true,
      render: (media: IntelMedia) => (
        <span className="text-white/60 text-xs">{media.publisher}</span>
      ),
    },
    {
      key: 'publicationDate',
      label: 'Date',
      sortable: true,
      render: (media: IntelMedia) => (
        <span className="text-white/60 text-xs font-mono">{formatDate(media.publicationDate)}</span>
      ),
    },
    {
      key: 'durationMinutes',
      label: 'Duration',
      render: (media: IntelMedia) => (
        <span className="text-white/40 text-xs font-mono">
          {media.durationMinutes ? `${media.durationMinutes} min` : '—'}
        </span>
      ),
    },
    {
      key: 'sentiment',
      label: 'Sentiment',
      sortable: true,
      render: (media: IntelMedia) => (
        <Badge variant={sentimentVariant(media.sentiment)}>{media.sentiment}</Badge>
      ),
    },
    {
      key: 'speakers',
      label: 'Speakers',
      render: (media: IntelMedia) => (
        <div className="flex flex-wrap gap-1">
          {media.cantonSpeakerIds.slice(0, 2).map(id => {
            const person = getPersonById(id);
            return person ? (
              <span key={id} className="text-[9px] px-1.5 py-0.5 bg-white/5 border border-white/10 rounded-full font-mono text-white/50">
                {person.fullName.split(' ').pop()}
              </span>
            ) : null;
          })}
          {media.cantonSpeakerIds.length > 2 && (
            <span className="text-[9px] text-white/30 font-mono">+{media.cantonSpeakerIds.length - 2}</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full p-4">
      <DataTable
        columns={columns}
        data={filteredData}
        searchable
        searchPlaceholder="Search media..."
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
        getRowId={(m) => m.id}
        onRowClick={onSelectMedia}
      />
    </div>
  );
}
