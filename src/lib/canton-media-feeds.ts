/**
 * Canton Network Media Feeds — channel definitions, video types, and seed data
 * Used by the Monitor tab in the Intelligence Dashboard
 */

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

export interface MonitorChannel {
  id: string;
  channelId: string;         // YouTube channel ID (UC...)
  uploadsPlaylistId: string; // YouTube uploads playlist (UU...)
  name: string;
  handle?: string;           // @handle
  category: 'canton-core' | 'participant' | 'media' | 'industry';
}

export interface MonitorVideo {
  id: string;
  videoId: string;          // YouTube video ID (11 chars)
  title: string;
  channelName: string;
  channelId?: string;
  publishedAt: string;      // ISO 8601
  thumbnailUrl: string;
  duration?: string;        // "PT4M30S" ISO 8601 duration or "45:00"
  isLive: boolean;
  isUpcoming: boolean;
  viewCount?: number;
  description?: string;
  category: 'canton-core' | 'participant' | 'media' | 'industry';
}

/* ------------------------------------------------------------------ */
/* Canton-Related YouTube Channels                                     */
/* ------------------------------------------------------------------ */

export const MONITOR_CHANNELS: MonitorChannel[] = [
  {
    id: 'ch-da',
    channelId: 'UC1cC5_olEdXrDbjVVf8YzCA',
    uploadsPlaylistId: 'UU1cC5_olEdXrDbjVVf8YzCA',
    name: 'Digital Asset',
    handle: '@digitalassetcom',
    category: 'canton-core',
  },
  {
    id: 'ch-dtcc',
    channelId: 'UCi4dnJzd498IvBqP3wnUqpA',
    uploadsPlaylistId: 'UUi4dnJzd498IvBqP3wnUqpA',
    name: 'DTCC',
    handle: '@DTCC',
    category: 'participant',
  },
  {
    id: 'ch-deloitte',
    channelId: 'UCsaD8A0aS7MTFU7Nl7-sKVA',
    uploadsPlaylistId: 'UUsaD8A0aS7MTFU7Nl7-sKVA',
    name: 'Deloitte',
    handle: '@Deloitte',
    category: 'participant',
  },
  {
    id: 'ch-blockworks',
    channelId: 'UCATRzDJHwCIWgPuRHvfTBwQ',
    uploadsPlaylistId: 'UUATRzDJHwCIWgPuRHvfTBwQ',
    name: 'Blockworks',
    handle: '@BlockworksHQ',
    category: 'media',
  },
  {
    id: 'ch-coindesk',
    channelId: 'UCwF4AKUEFTEcGHe0eS1J0KQ',
    uploadsPlaylistId: 'UUwF4AKUEFTEcGHe0eS1J0KQ',
    name: 'CoinDesk',
    handle: '@CoinDesk',
    category: 'media',
  },
  {
    id: 'ch-wef',
    channelId: 'UCw-kH-Od73XDAt7qtH9uBYA',
    uploadsPlaylistId: 'UUw-kH-Od73XDAt7qtH9uBYA',
    name: 'World Economic Forum',
    handle: '@WorldEconomicForum',
    category: 'industry',
  },
  {
    id: 'ch-gs',
    channelId: 'UCIALMKvObZNtJ68-Topc5Eg',
    uploadsPlaylistId: 'UUIALMKvObZNtJ68-Topc5Eg',
    name: 'Goldman Sachs',
    handle: '@goldmansachs',
    category: 'participant',
  },
  {
    id: 'ch-broadridge',
    channelId: 'UCqFX6k7dSjWp7DYq5VEBbKQ',
    uploadsPlaylistId: 'UUqFX6k7dSjWp7DYq5VEBbKQ',
    name: 'Broadridge',
    handle: '@Broadridge',
    category: 'participant',
  },
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** YouTube thumbnail URL for a given video ID */
export function ytThumbnail(videoId: string, res: 'default' | 'mqdefault' | 'hqdefault' | 'sddefault' | 'maxresdefault' = 'mqdefault'): string {
  return `https://img.youtube.com/vi/${videoId}/${res}.jpg`;
}

/** YouTube embed URL with monitor-friendly defaults */
export function ytEmbedUrl(videoId: string, opts?: { autoplay?: boolean; mute?: boolean; controls?: boolean }): string {
  const { autoplay = false, mute = true, controls = true } = opts ?? {};
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    ...(autoplay ? { autoplay: '1' } : {}),
    ...(mute ? { mute: '1' } : {}),
    ...(controls ? {} : { controls: '0' }),
  });
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}

/** YouTube RSS feed URL for a channel */
export function ytRssFeedUrl(channelId: string): string {
  return `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
}

/** Relative time string (e.g., "3h ago", "2d ago") */
export function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 4) return `${diffWeek}w ago`;
  const diffMonth = Math.floor(diffDay / 30);
  return `${diffMonth}mo ago`;
}

/** Human-readable duration from "PT4M30S" or minutes number */
export function formatDuration(d?: string | number): string {
  if (!d) return '';
  if (typeof d === 'number') {
    const h = Math.floor(d / 60);
    const m = d % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:00` : `${m}:00`;
  }
  // Parse ISO 8601 duration PT1H2M30S
  const match = d.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return d;
  const h = parseInt(match[1] || '0');
  const m = parseInt(match[2] || '0');
  const s = parseInt(match[3] || '0');
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/* ------------------------------------------------------------------ */
/* Seed / Curated Videos (fallback when API is unavailable)            */
/* ------------------------------------------------------------------ */

export const SEED_VIDEOS: MonitorVideo[] = [
  {
    id: 'seed-001',
    videoId: 'lMB1WnTMJgs',
    title: 'What Is the Canton Network?',
    channelName: 'Digital Asset',
    channelId: 'UC1cC5_olEdXrDbjVVf8YzCA',
    publishedAt: '2025-09-15T14:00:00Z',
    thumbnailUrl: ytThumbnail('lMB1WnTMJgs'),
    duration: '6:42',
    isLive: false,
    isUpcoming: false,
    category: 'canton-core',
  },
  {
    id: 'seed-002',
    videoId: 'J8e_TlLCkJE',
    title: 'Canton Network: Global Synchronizer Explained',
    channelName: 'Digital Asset',
    channelId: 'UC1cC5_olEdXrDbjVVf8YzCA',
    publishedAt: '2025-08-20T16:00:00Z',
    thumbnailUrl: ytThumbnail('J8e_TlLCkJE'),
    duration: '12:15',
    isLive: false,
    isUpcoming: false,
    category: 'canton-core',
  },
  {
    id: 'seed-003',
    videoId: 'Zb6FQQ20tEk',
    title: 'Tokenized Assets & The Future of Finance',
    channelName: 'Goldman Sachs',
    channelId: 'UCIALMKvObZNtJ68-Topc5Eg',
    publishedAt: '2025-11-05T09:00:00Z',
    thumbnailUrl: ytThumbnail('Zb6FQQ20tEk'),
    duration: '28:40',
    isLive: false,
    isUpcoming: false,
    category: 'participant',
  },
  {
    id: 'seed-004',
    videoId: 'kBdfcR-8hEY',
    title: 'How DTCC is Modernizing Post-Trade Infrastructure',
    channelName: 'DTCC',
    channelId: 'UCi4dnJzd498IvBqP3wnUqpA',
    publishedAt: '2025-10-12T11:00:00Z',
    thumbnailUrl: ytThumbnail('kBdfcR-8hEY'),
    duration: '18:30',
    isLive: false,
    isUpcoming: false,
    category: 'participant',
  },
  {
    id: 'seed-005',
    videoId: 'QX3M8Ka9vUA',
    title: 'Institutional Crypto: The Next Phase',
    channelName: 'Blockworks',
    channelId: 'UCATRzDJHwCIWgPuRHvfTBwQ',
    publishedAt: '2026-01-08T15:00:00Z',
    thumbnailUrl: ytThumbnail('QX3M8Ka9vUA'),
    duration: '52:10',
    isLive: false,
    isUpcoming: false,
    category: 'media',
  },
  {
    id: 'seed-006',
    videoId: '1YyAzVmP9xQ',
    title: 'Blockchain in Financial Services: 2026 Outlook',
    channelName: 'Deloitte',
    channelId: 'UCsaD8A0aS7MTFU7Nl7-sKVA',
    publishedAt: '2026-01-02T10:00:00Z',
    thumbnailUrl: ytThumbnail('1YyAzVmP9xQ'),
    duration: '35:00',
    isLive: false,
    isUpcoming: false,
    category: 'participant',
  },
  {
    id: 'seed-007',
    videoId: 'pSTNhBlfV_s',
    title: 'The Promise of Tokenized Money Markets',
    channelName: 'CoinDesk',
    channelId: 'UCwF4AKUEFTEcGHe0eS1J0KQ',
    publishedAt: '2026-01-18T13:00:00Z',
    thumbnailUrl: ytThumbnail('pSTNhBlfV_s'),
    duration: '22:45',
    isLive: false,
    isUpcoming: false,
    category: 'media',
  },
  {
    id: 'seed-008',
    videoId: '6Uf2k_EVFnI',
    title: 'DLT & The Transformation of Capital Markets',
    channelName: 'World Economic Forum',
    channelId: 'UCw-kH-Od73XDAt7qtH9uBYA',
    publishedAt: '2026-01-22T08:00:00Z',
    thumbnailUrl: ytThumbnail('6Uf2k_EVFnI'),
    duration: '41:20',
    isLive: false,
    isUpcoming: false,
    category: 'industry',
  },
  {
    id: 'seed-009',
    videoId: 'rqYrNrIFM_A',
    title: 'Broadridge: Reimagining Distributed Ledger for Repos',
    channelName: 'Broadridge',
    channelId: 'UCqFX6k7dSjWp7DYq5VEBbKQ',
    publishedAt: '2025-12-10T12:00:00Z',
    thumbnailUrl: ytThumbnail('rqYrNrIFM_A'),
    duration: '15:55',
    isLive: false,
    isUpcoming: false,
    category: 'participant',
  },
];
