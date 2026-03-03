import { NextResponse } from 'next/server';

export interface MarketPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  sparkline?: number[];
}

interface CoinGeckoResponse {
  bitcoin?: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
  ethereum?: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
  'canton-network'?: {
    usd: number;
    usd_24h_change: number;
    usd_24h_vol: number;
    usd_market_cap: number;
  };
}

// Fallback mock data for when CoinGecko is down or Canton isn't available
const fallbackData: MarketPrice[] = [
  {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 67842.33,
    change24h: 2.45,
    volume24h: 15234567890,
    marketCap: 1340000000000,
    sparkline: [67200, 67500, 67800, 67400, 67600, 67900, 67842, 67850],
  },
  {
    symbol: 'ETH',
    name: 'Ethereum',
    price: 3842.56,
    change24h: -1.23,
    volume24h: 8765432100,
    marketCap: 462000000000,
    sparkline: [3900, 3850, 3820, 3880, 3860, 3840, 3845, 3842],
  },
  {
    symbol: 'CC',
    name: 'Canton',
    price: 0.1576,
    change24h: -2.82,
    volume24h: 14230000,
    marketCap: 5980000000,
    sparkline: [0.1520, 0.1545, 0.1560, 0.1575, 0.1590, 0.1585, 0.1578, 0.1576],
  },
];

// Generate realistic sparkline data
function generateSparkline(basePrice: number, points: number = 24, symbol: string = ''): number[] {
  // Seeded PRNG for deterministic sparklines per symbol per day
  const dateStr = new Date().toISOString().slice(0, 10);
  let seed = 0;
  for (const ch of symbol + dateStr) seed = ((seed << 5) - seed + ch.charCodeAt(0)) | 0;
  const prng = () => {
    seed = (seed * 16807 + 0x7fffffff) % 0x7fffffff;
    return seed / 0x7fffffff;
  };
  const data: number[] = [];
  let price = basePrice;
  for (let i = 0; i < points; i++) {
    const change = (prng() - 0.5) * basePrice * 0.02;
    price += change;
    data.push(Math.round(price * 100) / 100);
  }
  return data;
}

// Server-side cache
let cachedData: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

// Commodity data (simulated with small variance)
function getCommodityData(): MarketPrice[] {
  const variance = () => 1 + (Math.random() - 0.5) * 0.005; // ±0.25%
  return [
    { symbol: 'XAU', name: 'Gold', price: 2650.40 * variance(), change24h: 0.32, volume24h: 0, marketCap: 0, sparkline: generateSparkline(2650.40, 8, 'XAU') },
    { symbol: 'WTI', name: 'Crude Oil', price: 71.25 * variance(), change24h: -0.85, volume24h: 0, marketCap: 0, sparkline: generateSparkline(71.25, 8, 'WTI') },
    { symbol: 'EUR/USD', name: 'EUR/USD', price: 1.0842 * variance(), change24h: 0.12, volume24h: 0, marketCap: 0, sparkline: generateSparkline(1.0842, 8, 'EURUSD') },
    { symbol: 'GBP/USD', name: 'GBP/USD', price: 1.2654 * variance(), change24h: -0.15, volume24h: 0, marketCap: 0, sparkline: generateSparkline(1.2654, 8, 'GBPUSD') },
    { symbol: 'XAG', name: 'Silver', price: 31.15 * variance(), change24h: 0.67, volume24h: 0, marketCap: 0, sparkline: generateSparkline(31.15, 8, 'XAG') },
  ];
}

export async function GET() {
  // Check cache first
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_TTL) {
    return NextResponse.json(cachedData.data);
  }

  try {
    // Fetch from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,canton-network&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
      {
        next: { revalidate: 30 }, // Cache for 30 seconds
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Canton-Intelligence-Dashboard/1.0',
        },
      }
    );

    let data: CoinGeckoResponse = {};
    
    if (!response.ok) {
      console.warn('CoinGecko API error:', response.status, response.statusText);
      // Fall back to mock data if CoinGecko fails
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
      });
    }

    data = await response.json();

    // Transform CoinGecko response to our format
    const marketPrices: MarketPrice[] = [];

    if (data.bitcoin) {
      marketPrices.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        price: data.bitcoin.usd,
        change24h: data.bitcoin.usd_24h_change || 0,
        volume24h: data.bitcoin.usd_24h_vol || 0,
        marketCap: data.bitcoin.usd_market_cap || 0,
        sparkline: generateSparkline(data.bitcoin.usd, 8, 'BTC'),
      });
    }

    if (data.ethereum) {
      marketPrices.push({
        symbol: 'ETH',
        name: 'Ethereum',
        price: data.ethereum.usd,
        change24h: data.ethereum.usd_24h_change || 0,
        volume24h: data.ethereum.usd_24h_vol || 0,
        marketCap: data.ethereum.usd_market_cap || 0,
        sparkline: generateSparkline(data.ethereum.usd, 8, 'ETH'),
      });
    }

    // Canton might not be available on CoinGecko, so include fallback
    if (data['canton-network']) {
      marketPrices.push({
        symbol: 'CC',
        name: 'Canton',
        price: data['canton-network'].usd,
        change24h: data['canton-network'].usd_24h_change || 0,
        volume24h: data['canton-network'].usd_24h_vol || 0,
        marketCap: data['canton-network'].usd_market_cap || 0,
        sparkline: generateSparkline(data['canton-network'].usd, 8, 'CC'),
      });
    } else {
      // Add fallback Canton data
      marketPrices.push(fallbackData[2]);
    }

    // Append commodity data
    const commodities = getCommodityData();
    const allData = [...marketPrices, ...commodities];

    // If no data was returned at all, use fallback
    if (allData.length === 0) {
      const fallbackResponse = {
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
      };
      cachedData = { data: fallbackResponse, timestamp: Date.now() };
      return NextResponse.json(fallbackResponse);
    }

    const response_data = {
      success: true,
      data: allData,
      source: 'coingecko',
      timestamp: new Date().toISOString(),
    };
    cachedData = { data: response_data, timestamp: Date.now() };
    return NextResponse.json(response_data);

  } catch (error) {
    console.error('Market API error:', error);
    
    // Return fallback data on any error
    return NextResponse.json({
      success: true,
      data: fallbackData,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    });
  }
}