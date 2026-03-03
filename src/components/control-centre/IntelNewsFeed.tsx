'use client';

import { useState, useEffect } from 'react';

interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
}

const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Canton Network Completes Cross-Border Repo Transaction with Major Banks',
    url: '#',
    source: 'Digital Asset Blog',
    publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    summary: 'DTCC, Broadridge and BNY successfully execute first cross-border intraday repo on Canton Network.'
  },
  {
    id: '2', 
    title: 'Goldman Sachs Digital Asset Platform Goes Live on Canton',
    url: '#',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    summary: 'GS DAP™ processes tokenized treasury bonds with same-day settlement via Canton Network.'
  },
  {
    id: '3',
    title: 'HQLAx Collateral Mobility Platform Reaches $50B in Assets',
    url: '#',
    source: 'The Block',
    publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    title: 'Broadridge DLR Processes Record Intraday Repo Volume',
    url: '#',
    source: 'Canton Network',
    publishedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    summary: 'Distributed Ledger Repo platform handles $2.1B in single-day repo transactions.'
  },
  {
    id: '5',
    title: 'HKEX Synapse Connects Asian Markets to Canton Network',
    url: '#',
    source: 'Reuters',
    publishedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    title: 'Paxos Launches Stablecoin Settlement on Canton Network',
    url: '#',
    source: 'Bloomberg',
    publishedAt: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'USDP stablecoin now available for atomic DvP settlement across Canton participants.'
  },
  {
    id: '7',
    title: 'Canton Network Validator Count Exceeds 100 Nodes',
    url: '#',
    source: 'Digital Asset Blog',
    publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '8',
    title: 'Euroclear Integrates Collateral Management with Canton Network',
    url: '#',
    source: 'Financial Times',
    publishedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'European CSD enables real-time collateral mobility across 20+ Canton participants.'
  },
  {
    id: '9',
    title: 'Circle USDC Deployed as Settlement Currency on Canton',
    url: '#',
    source: 'CoinDesk',
    publishedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '10',
    title: 'Canton Network Global Sync Commits Surpass 1 Million Daily',
    url: '#',
    source: 'Canton Network',
    publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    summary: 'Daily commit volume milestone driven by repo financing and cross-border settlement flows.'
  },
];

function timeAgo(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

interface IntelNewsFeedProps {
  className?: string;
}

interface LoadingSkeletonProps {
  index: number;
}

function LoadingSkeleton({ index }: LoadingSkeletonProps) {
  const delay = index * 100; // Stagger animation
  
  return (
    <div 
      className="p-3 border-b border-white/5"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="space-y-2">
        <div className="flex gap-2 items-center">
          <div className="h-2 bg-white/5 rounded animate-pulse w-16"></div>
          <div className="h-2 bg-white/5 rounded animate-pulse w-8"></div>
        </div>
        <div className="space-y-1">
          <div className="h-3 bg-white/5 rounded animate-pulse w-full"></div>
          <div className="h-3 bg-white/5 rounded animate-pulse w-3/4"></div>
        </div>
        <div className="h-2 bg-white/5 rounded animate-pulse w-5/6"></div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="relative mb-4">
        <div className="w-8 h-8 border-2 border-white/10 border-t-emerald-500/50 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-8 h-8 border border-white/5 rounded-full animate-ping"></div>
      </div>
      <p className="text-[10px] text-white/20 font-mono text-center">
        Monitoring Canton Network sources...
      </p>
    </div>
  );
}

interface NewsCardProps {
  item: NewsItem;
  onClick: () => void;
}

function NewsCard({ item, onClick }: NewsCardProps) {
  return (
    <div 
      onClick={onClick}
      className="p-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
    >
      <div className="space-y-2">
        {/* Header with source and time */}
        <div className="flex items-center gap-2">
          <span className="text-[8px] font-mono font-bold px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40">
            {item.source}
          </span>
          <span className="text-[8px] font-mono text-white/20">
            {timeAgo(item.publishedAt)}
          </span>
        </div>
        
        {/* Title */}
        <h3 className="text-[11px] font-bold text-white/80 group-hover:text-white leading-tight line-clamp-2 transition-colors">
          {item.title}
        </h3>
        
        {/* Summary if available */}
        {item.summary && (
          <p className="text-[10px] text-white/30 line-clamp-2 mt-1 leading-relaxed">
            {item.summary}
          </p>
        )}
      </div>
    </div>
  );
}

export default function IntelNewsFeed({ className }: IntelNewsFeedProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);

  // Simulate loading delay for visual effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setNews(MOCK_NEWS);
      setIsLoading(false);
    }, 1200); // 1.2s simulated load
    return () => clearTimeout(timer);
  }, []);

  const handleNewsClick = (item: NewsItem) => {
    if (item.url !== '#') {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className={`bg-black/40 backdrop-blur-sm h-full flex flex-col ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2">
          <h2 className="text-[9px] font-bold font-mono tracking-[0.2em] text-white/40">
            CANTON NETWORK INTEL
          </h2>
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      {/* Feed Container */}
      <div className="flex-1 overflow-y-auto intel-feed-scroll">
        {isLoading ? (
          <div>
            {[...Array(5)].map((_, index) => (
              <LoadingSkeleton key={index} index={index} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <EmptyState />
        ) : (
          <div>
            {news.map((item) => (
              <NewsCard 
                key={item.id} 
                item={item} 
                onClick={() => handleNewsClick(item)}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .intel-feed-scroll::-webkit-scrollbar {
          width: 3px;
        }
        .intel-feed-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .intel-feed-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .intel-feed-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.15);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}