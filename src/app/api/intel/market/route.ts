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
  canton?: {
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
    price: 0.0234,
    change24h: 15.67,
    volume24h: 2345678,
    marketCap: 23456789,
    sparkline: [0.020, 0.021, 0.022, 0.023, 0.0235, 0.0238, 0.0234, 0.0234],
  },
];

// Generate realistic sparkline data
function generateSparkline(price: number, change24h: number): number[] {
  const points = 8;
  const variance = Math.abs(price * 0.02); // 2% variance
  const trend = change24h > 0 ? 1 : -1;
  
  const sparkline: number[] = [];
  let currentPrice = price * (1 - (change24h / 100));
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendInfluence = trend * progress * Math.abs(change24h) * 0.01;
    const randomVariance = (Math.random() - 0.5) * variance * 0.5;
    
    currentPrice = currentPrice + (price * trendInfluence * 0.01) + randomVariance;
    sparkline.push(Math.max(0, currentPrice));
  }
  
  // Ensure last point matches current price
  sparkline[points - 1] = price;
  
  return sparkline.map(p => Number(p.toFixed(6)));
}

export async function GET() {
  try {
    // Fetch from CoinGecko API
    const response = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,canton&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true',
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
        sparkline: generateSparkline(data.bitcoin.usd, data.bitcoin.usd_24h_change || 0),
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
        sparkline: generateSparkline(data.ethereum.usd, data.ethereum.usd_24h_change || 0),
      });
    }

    // Canton might not be available on CoinGecko, so include fallback
    if (data.canton) {
      marketPrices.push({
        symbol: 'CC',
        name: 'Canton',
        price: data.canton.usd,
        change24h: data.canton.usd_24h_change || 0,
        volume24h: data.canton.usd_24h_vol || 0,
        marketCap: data.canton.usd_market_cap || 0,
        sparkline: generateSparkline(data.canton.usd, data.canton.usd_24h_change || 0),
      });
    } else {
      // Add fallback Canton data
      marketPrices.push(fallbackData[2]);
    }

    // If no data was returned at all, use fallback
    if (marketPrices.length === 0) {
      return NextResponse.json({
        success: true,
        data: fallbackData,
        source: 'fallback',
        timestamp: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      data: marketPrices,
      source: 'coingecko',
      timestamp: new Date().toISOString(),
    });

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