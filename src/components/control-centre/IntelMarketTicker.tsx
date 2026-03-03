'use client';

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketData } from '@/hooks/useMarketData';

interface SparklineProps {
  data: number[];
  width: number;
  height: number;
  positive: boolean;
}

function Sparkline({ data, width, height, positive }: SparklineProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  // If range is 0 (flat line), show a slight upward trend
  const normalizedData = range === 0 
    ? data.map((_, i) => height * 0.8 - (i / data.length) * height * 0.2)
    : data.map(value => height - ((value - min) / range) * height);

  const pathData = normalizedData
    .map((y, i) => {
      const x = (i / (data.length - 1)) * width;
      return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="inline-block">
      <path
        d={pathData}
        stroke={positive ? 'currentColor' : 'currentColor'}
        strokeWidth="1"
        fill="none"
        className={positive ? 'text-emerald-400' : 'text-rose-400'}
        opacity="0.6"
      />
    </svg>
  );
}

interface TickerItemProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  sparkline?: number[];
}

function TickerItem({ symbol, name: _name, price, change24h, sparkline }: TickerItemProps) {
  const isPositive = change24h >= 0;
  const isFx = ['EUR/USD', 'GBP/USD', 'USD/JPY'].includes(symbol?.toUpperCase());
  const formattedPrice = isFx
    ? price.toFixed(4)
    : price > 1 
      ? new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(price)
      : new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 4,
          maximumFractionDigits: 6,
        }).format(price);
  
  const changeDisplay = `${isPositive ? '+' : ''}${change24h.toFixed(2)}%`;

  return (
    <div className="inline-flex items-center gap-2 px-3">
      <span className="font-bold text-white tracking-wider">
        {symbol}
      </span>
      
      {sparkline && sparkline.length > 1 && (
        <Sparkline 
          data={sparkline} 
          width={24} 
          height={12} 
          positive={isPositive}
        />
      )}
      
      <span className="text-white/90">
        {formattedPrice}
      </span>
      
      <div className={`flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isPositive ? (
          <TrendingUp className="w-3 h-3" />
        ) : (
          <TrendingDown className="w-3 h-3" />
        )}
        <span className="font-medium">
          {changeDisplay}
        </span>
      </div>
      
      <span className="text-white/20 text-xs">·</span>
    </div>
  );
}

export default function IntelMarketTicker() {
  const { prices, isLive, lastUpdate: _lastUpdate, isLoading } = useMarketData();

  if (isLoading) {
    return (
      <div className="h-8 bg-black border-b border-white/10 flex items-center px-4">
        <div className="text-white/30 text-[9px] uppercase tracking-wider font-mono">
          CANTON MARKETS
        </div>
        <div className="ml-4 text-white/50 text-[11px] font-mono">
          Loading market data...
        </div>
      </div>
    );
  }

  // Create duplicated items for seamless scrolling
  const tickerItems = [...prices, ...prices];

  return (
    <>
      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translate3d(0%, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        
        .marquee-container {
          mask-image: linear-gradient(
            to right, 
            transparent, 
            black 5%, 
            black 95%, 
            transparent
          );
        }
        
        .marquee-content {
          animation: marquee 60s linear infinite;
          will-change: transform;
        }
      `}</style>
      
      <div className="h-8 bg-black border-b border-white/10 relative overflow-hidden font-mono text-[11px] tabular-nums">
        {/* Left Label */}
        <div className="absolute left-0 top-0 h-full bg-black flex items-center px-4 z-10">
          <span className="text-white/30 text-[9px] uppercase tracking-wider">
            CANTON MARKETS
          </span>
          
          {/* Live/Delayed Badge */}
          <div className={`ml-3 flex items-center gap-1.5 px-2 py-0.5 rounded-sm ${
            isLive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${
              isLive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <span className="text-[8px] font-bold tracking-wide">
              {isLive ? 'LIVE' : 'DELAYED'}
            </span>
          </div>
        </div>

        {/* Scrolling Ticker */}
        <div className="marquee-container h-full flex items-center">
          <div className="marquee-content flex items-center whitespace-nowrap pl-64">
            {tickerItems.map((price, index) => (
              <TickerItem
                key={`${price.symbol}-${index}`}
                symbol={price.symbol}
                name={price.name}
                price={price.price}
                change24h={price.change24h}
                sparkline={price.sparkline}
              />
            ))}
          </div>
        </div>

        {/* Right Gradient Fade */}
        <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black to-transparent pointer-events-none" />
      </div>
    </>
  );
}