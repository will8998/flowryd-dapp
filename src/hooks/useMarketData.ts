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

  // Fetch data from our API endpoint
  const fetchMarketData = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch('/api/intel/market');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setPrices(result.data);
        setLastUpdate(new Date());
        setIsLoading(false);
      } else {
        throw new Error('Invalid API response format');
      }
    } catch (err) {
      console.error('Failed to fetch market data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      setIsLoading(false);
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

  // Connect to Binance WebSocket
  const connectWebSocket = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      // Binance WebSocket for BTC/USDT and ETH/USDT 24hr tickers
      const ws = new WebSocket('wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker');
      
      ws.onopen = () => {
        console.log('Binance WebSocket connected');
        setIsLive(true);
        setError(null);
        
        // Clear any existing reconnection timeout
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
          reconnectTimeoutRef.current = null;
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: BinanceTickerData = JSON.parse(event.data);
          
          let symbol: string;
          if (data.s === 'BTCUSDT') {
            symbol = 'BTC';
          } else if (data.s === 'ETHUSDT') {
            symbol = 'ETH';
          } else {
            return; // Ignore other symbols
          }

          const price = parseFloat(data.c);
          const change24h = parseFloat(data.P);

          if (!isNaN(price)) {
            updateCoinPrice(symbol, price, change24h);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setIsLive(false);
      };

      ws.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        setIsLive(false);
        wsRef.current = null;

        // Attempt to reconnect after 5 seconds if not manually closed
        if (event.code !== 1000) {
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect WebSocket...');
            connectWebSocket();
          }, 5000);
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      setIsLive(false);
      
      // Retry connection after 10 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connectWebSocket();
      }, 10000);
    }
  }, [updateCoinPrice]);

  // Initialize data fetching and WebSocket
  useEffect(() => {
    // Initial data fetch
    fetchMarketData();

    // Set up polling interval (60 seconds)
    pollIntervalRef.current = setInterval(() => {
      fetchMarketData();
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