'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { MarketPrice } from '@/app/api/intel/market/route';

interface BinanceTickerData {
  s: string; // Symbol
  c: string; // Current price
  P: string; // 24h price change percentage
  q: string; // 24h quote volume
}

interface MarketDataReturn {
  prices: MarketPrice[];
  isLive: boolean;
  lastUpdate: Date;
  isLoading: boolean;
  error: string | null;
}

export function useMarketData(): MarketDataReturn {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsFailedRef = useRef(false);

  // Fetch data from our API endpoint
  const fetchMarketData = useCallback(async (silent = false) => {
    try {
      if (!silent) setError(null);
      const response = await fetch('/api/intel/market');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPrices(result.data);
        setLastUpdate(new Date());
        if (!silent) setIsLoading(false);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      if (!silent) {
        console.error('Failed to fetch market data:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
        setIsLoading(false);
      }
    }
  }, []);

  // Update specific coin price from WebSocket data
  const updateCoinPrice = useCallback((symbol: string, newPrice: number, change24h?: number) => {
    setPrices(prevPrices => 
      prevPrices.map(coin => {
        if (coin.symbol === symbol) {
          // Update sparkline with new price
          const newSparkline = coin.sparkline ? [...coin.sparkline.slice(1), newPrice] : [newPrice];
          
          return {
            ...coin,
            price: newPrice,
            ...(change24h !== undefined && { change24h }),
            sparkline: newSparkline,
          };
        }
        return coin;
      })
    );
    setLastUpdate(new Date());
  }, []);

  // Switch to fast polling (15s) when WebSocket is unavailable
  const switchToFastPolling = useCallback(() => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(() => {
      fetchMarketData(true);
    }, 15000);
    // Mark as live since we're actively polling
    setIsLive(true);
  }, [fetchMarketData]);

  // Connect to Binance WebSocket
  const connectWebSocket = useCallback(() => {
    // Skip WebSocket entirely if it already failed once this session
    if (wsFailedRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    try {
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');

      // If connection doesn't open within 5s, give up and use polling
      const connectionTimeout = setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          ws.close();
          wsFailedRef.current = true;
          switchToFastPolling();
        }
      }, 5000);

      ws.onopen = () => {
        clearTimeout(connectionTimeout);
        setIsLive(true);
        setError(null);
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: BinanceTickerData = JSON.parse(event.data);
          let symbol: string;
          if (data.s === 'BTCUSDT') symbol = 'BTC';
          else if (data.s === 'ETHUSDT') symbol = 'ETH';
          else return;

          const price = parseFloat(data.c);
          const change24h = parseFloat(data.P);
          if (!isNaN(price)) updateCoinPrice(symbol, price, change24h);
        } catch {
          // Silently ignore parse errors
        }
      };

      ws.onerror = () => {
        // Silently handle — fall back to polling
        clearTimeout(connectionTimeout);
        wsFailedRef.current = true;
        setIsLive(false);
        switchToFastPolling();
      };

      ws.onclose = (event) => {
        setIsLive(false);
        wsRef.current = null;
        clearTimeout(connectionTimeout);

        // Only attempt one reconnect, then fall back to polling
        if (event.code !== 1000 && !wsFailedRef.current) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        } else if (wsFailedRef.current) {
          switchToFastPolling();
        }
      };

      wsRef.current = ws;
    } catch {
      // WebSocket constructor failed — fall back to polling silently
      wsFailedRef.current = true;
      setIsLive(false);
      switchToFastPolling();
    }
  }, [updateCoinPrice, switchToFastPolling]);

  // Initialize data fetching and WebSocket
  useEffect(() => {
    // Initial data fetch
    fetchMarketData();

    // Set up silent polling interval (60 seconds, stale-while-revalidate)
    pollIntervalRef.current = setInterval(() => {
      fetchMarketData(true);
    }, 60000);

    // Connect to WebSocket
    connectWebSocket();

    // Cleanup function
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }

      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmounting');
        wsRef.current = null;
      }

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [fetchMarketData, connectWebSocket]);

  // Handle page visibility change to manage connections
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page is hidden, close WebSocket to save resources
        if (wsRef.current) {
          wsRef.current.close(1000, 'Page hidden');
        }
      } else {
        // Page is visible, reconnect WebSocket
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          connectWebSocket();
        }
        // Also refresh data when page becomes visible
        fetchMarketData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [connectWebSocket, fetchMarketData]);

  return {
    prices,
    isLive,
    lastUpdate,
    isLoading,
    error,
  };
}