import { NextResponse } from 'next/server';
import {
  MONITOR_CHANNELS,
  SEED_VIDEOS,
  ytThumbnail,
  type MonitorVideo,
} from '@/lib/canton-media-feeds';

/* ------------------------------------------------------------------ */
/* In-memory cache (5 min TTL)                                         */
/* ------------------------------------------------------------------ */

interface CacheEntry {
  data: MonitorVideo[];
  ts: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
let cache: CacheEntry | null = null;

/* ------------------------------------------------------------------ */
/* RSS XML → MonitorVideo[]                                            */
/* ------------------------------------------------------------------ */

function parseRssEntry(entryXml: string, channelName: string, channelId: string, category: MonitorVideo['category']): MonitorVideo | null {
  const videoIdMatch = entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/);
  const titleMatch = entryXml.match(/<title>([^<]+)<\/title>/);
  const publishedMatch = entryXml.match(/<published>([^<]+)<\/published>/);
  const thumbnailMatch = entryXml.match(/<media:thumbnail\s+url="([^"]+)"/);

  if (!videoIdMatch || !titleMatch) return null;

  const videoId = videoIdMatch[1];
  const title = titleMatch[1]
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  return {
    id: `rss-${channelId}-${videoId}`,
    videoId,
    title,
    channelName,
    channelId,
    publishedAt: publishedMatch?.[1] ?? new Date().toISOString(),
    thumbnailUrl: thumbnailMatch?.[1] ?? ytThumbnail(videoId),
    isLive: false,
    isUpcoming: false,
    category,
  };
}

function parseRssFeed(xml: string, channelName: string, channelId: string, category: MonitorVideo['category']): MonitorVideo[] {
  const entries: MonitorVideo[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const video = parseRssEntry(match[1], channelName, channelId, category);
    if (video) entries.push(video);
  }

  return entries;
}

/* ------------------------------------------------------------------ */
/* Fetch videos from all configured channels                           */
/* ------------------------------------------------------------------ */

async function fetchChannelVideos(): Promise<MonitorVideo[]> {
  const allVideos: MonitorVideo[] = [];

  const fetches = MONITOR_CHANNELS.map(async (channel) => {
    try {
      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.channelId}`;
      const response = await fetch(rssUrl, {
        signal: AbortSignal.timeout(8000),
        headers: { 'Accept': 'application/xml' },
      });

      if (!response.ok) return [];

      const xml = await response.text();
      return parseRssFeed(xml, channel.name, channel.channelId, channel.category);
    } catch {
      // Channel fetch failed — return empty (will fall back to seed data)
      return [];
    }
  });

  const results = await Promise.allSettled(fetches);
  for (const result of results) {
    if (result.status === 'fulfilled') {
      allVideos.push(...result.value);
    }
  }

  return allVideos;
}

/* ------------------------------------------------------------------ */
/* GET /api/intel/videos                                               */
/* ------------------------------------------------------------------ */

export async function GET() {
  try {
    // Return cached data if fresh
    if (cache && Date.now() - cache.ts < CACHE_TTL_MS) {
      return NextResponse.json({
        videos: cache.data,
        source: 'cache',
        channels: MONITOR_CHANNELS.length,
        cachedAt: new Date(cache.ts).toISOString(),
      });
    }

    // Fetch fresh from RSS feeds
    const rssVideos = await fetchChannelVideos();

    // Merge RSS results with seed videos (seed as fallback)
    // Deduplicate by videoId (RSS takes precedence)
    const rssVideoIds = new Set(rssVideos.map(v => v.videoId));
    const uniqueSeed = SEED_VIDEOS.filter(v => !rssVideoIds.has(v.videoId));
    const merged = [...rssVideos, ...uniqueSeed];

    // Sort by publication date (newest first)
    merged.sort((a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Cache the result
    cache = { data: merged, ts: Date.now() };

    return NextResponse.json({
      videos: merged,
      source: rssVideos.length > 0 ? 'rss' : 'seed',
      channels: MONITOR_CHANNELS.length,
      rssCount: rssVideos.length,
      seedCount: uniqueSeed.length,
    });
  } catch {
    // Total failure — return seed data
    return NextResponse.json({
      videos: SEED_VIDEOS,
      source: 'seed-fallback',
      channels: MONITOR_CHANNELS.length,
    });
  }
}
