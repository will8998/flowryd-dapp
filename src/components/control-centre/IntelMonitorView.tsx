'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, X, RefreshCw, Wifi, WifiOff, Monitor } from 'lucide-react';
import {
  type MonitorVideo,
  SEED_VIDEOS,
  ytEmbedUrl,
  timeAgo,
} from '@/lib/canton-media-feeds';

const CATEGORY_COLORS: Record<string, string> = {
  'canton-core': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  participant: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  media: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  industry: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
};

const CATEGORY_LABELS: Record<string, string> = {
  'canton-core': 'CANTON',
  participant: 'PARTICIPANT',
  media: 'MEDIA',
  industry: 'INDUSTRY',
};

function VideoTile({
  video,
  isPlaying,
  onPlay,
  onClose,
}: {
  video: MonitorVideo;
  isPlaying: boolean;
  onPlay: () => void;
  onClose: () => void;
}) {
  const [imgError, setImgError] = useState(false);
  const catColor = CATEGORY_COLORS[video.category] ?? CATEGORY_COLORS.industry;
  const catLabel = CATEGORY_LABELS[video.category] ?? video.category.toUpperCase();

  if (isPlaying) {
    return (
      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-white/10">
        <iframe
          src={ytEmbedUrl(video.videoId, { autoplay: true, mute: false, controls: true })}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          className="absolute top-2 right-2 z-10 w-7 h-7 bg-black/70 backdrop-blur-sm rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-black/90 transition-all"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="group cursor-pointer rounded-lg overflow-hidden border border-white/5 hover:border-white/15 transition-all bg-white/[0.02] hover:bg-white/[0.04]"
      onClick={onPlay}
    >
      <div className="relative aspect-video bg-zinc-900 overflow-hidden">
        {!imgError ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900">
            <Monitor className="w-8 h-8 text-white/10" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
            <Play className="w-5 h-5 text-white ml-0.5" />
          </div>
        </div>

        {video.isLive && (
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 bg-red-600 rounded text-[9px] font-bold text-white tracking-wider">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        )}

        {video.isUpcoming && (
          <div className="absolute top-2 left-2 px-2 py-0.5 bg-amber-600/90 rounded text-[9px] font-bold text-white tracking-wider">
            UPCOMING
          </div>
        )}

        {video.duration && (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-[9px] font-mono text-white/80">
            {video.duration}
          </div>
        )}

        <div className="absolute top-2 right-2">
          <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${catColor}`}>
            {catLabel}
          </span>
        </div>
      </div>

      <div className="p-3">
        <div className="text-xs font-medium text-white/90 line-clamp-2 leading-tight mb-1.5">
          {video.title}
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-white/35 font-mono">
          <span>{video.channelName}</span>
          <span className="text-white/15">·</span>
          <span>{timeAgo(video.publishedAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function IntelMonitorView() {
  const [videos, setVideos] = useState<MonitorVideo[]>(SEED_VIDEOS);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<string | null>(null);
  const [source, setSource] = useState<string>('seed');
  const refreshTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/intel/videos');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.videos?.length > 0) {
        setVideos(data.videos);
        setSource(data.source ?? 'api');
        setIsOnline(true);
      }
      setLastFetch(new Date().toISOString());
    } catch {
      setIsOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    refreshTimerRef.current = setInterval(fetchVideos, 5 * 60 * 1000);
    return () => {
      if (refreshTimerRef.current) clearInterval(refreshTimerRef.current);
    };
  }, [fetchVideos]);

  const handlePlay = useCallback((id: string) => setPlayingId(id), []);
  const handleClose = useCallback(() => setPlayingId(null), []);

  return (
    <div className="w-full flex flex-col bg-zinc-950">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-white/30" />
          <span className="text-[10px] font-mono text-white/40 tracking-widest">
            CANTON NETWORK MONITOR
          </span>
          <span className="text-[9px] font-mono text-white/20">
            {videos.length} feeds
          </span>
        </div>

        <div className="flex items-center gap-3">
          {lastFetch && (
            <span className="text-[9px] font-mono text-white/20">
              {source === 'rss' ? 'LIVE' : source.toUpperCase()} · {timeAgo(lastFetch)}
            </span>
          )}
          <div className="flex items-center gap-1">
            {isOnline ? (
              <Wifi className="w-3 h-3 text-emerald-500/60" />
            ) : (
              <WifiOff className="w-3 h-3 text-red-500/60" />
            )}
          </div>
          <button
            onClick={fetchVideos}
            disabled={isLoading}
            className="p-1 rounded hover:bg-white/5 text-white/30 hover:text-white/60 transition-all disabled:opacity-30"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {videos.map((video) => (
            <VideoTile
              key={video.id}
              video={video}
              isPlaying={playingId === video.id}
              onPlay={() => handlePlay(video.id)}
              onClose={handleClose}
            />
          ))}
        </div>

        {videos.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-64 text-white/20">
            <Monitor className="w-10 h-10 mb-3 opacity-30" />
            <div className="text-sm font-mono">No feeds available</div>
            <div className="text-xs font-mono mt-1">Check channel configuration</div>
          </div>
        )}
      </div>

      <div className="h-7 bg-black/40 border-t border-white/5 flex items-center px-4 overflow-hidden flex-shrink-0">
        <div className="flex items-center animate-marquee whitespace-nowrap">
          {videos.slice(0, 6).map((v, i) => (
            <span key={v.id} className="text-[9px] font-mono text-white/25 mx-4">
              {i === 0 && <span className="text-cyan-400/40 mr-2">▸</span>}
              <span className="text-white/40">{v.channelName}</span>
              <span className="text-white/10 mx-1.5">—</span>
              {v.title.length > 50 ? v.title.slice(0, 50) + '…' : v.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
