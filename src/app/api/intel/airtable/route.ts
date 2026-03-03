import { NextRequest, NextResponse } from 'next/server';
import {
  fetchEvents,
  fetchPeople,
  fetchMedia,
  fetchAnnouncements,
  isAirtableConfigured,
} from '@/lib/airtable';

// ── Types ───────────────────────────────────────────────────────

type TableType = 'events' | 'people' | 'media' | 'announcements';

interface ApiResponse<T> {
  data: T;
  source: 'airtable' | 'mock';
  configured: boolean;
  timestamp: string;
}

interface ErrorResponse {
  error: string;
  message: string;
  timestamp: string;
}

// ── Route Handler ───────────────────────────────────────────────

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table') as TableType;

    // Validate table parameter
    if (!table) {
      return NextResponse.json(
        {
          error: 'Missing table parameter',
          message: 'Please specify a table: events, people, media, or announcements',
          timestamp: new Date().toISOString(),
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    if (!['events', 'people', 'media', 'announcements'].includes(table)) {
      return NextResponse.json(
        {
          error: 'Invalid table parameter',
          message: 'Table must be one of: events, people, media, announcements',
          timestamp: new Date().toISOString(),
        } satisfies ErrorResponse,
        { status: 400 }
      );
    }

    // Check if Airtable is configured
    const configured = isAirtableConfigured();
    let data: unknown;
    let source: 'airtable' | 'mock' = configured ? 'airtable' : 'mock';

    // Fetch data based on table type
    try {
      switch (table) {
        case 'events':
          data = await fetchEvents();
          break;
        case 'people':
          data = await fetchPeople();
          break;
        case 'media':
          data = await fetchMedia();
          break;
        case 'announcements':
          data = await fetchAnnouncements();
          break;
        default:
          // TypeScript should prevent this, but just in case
          throw new Error(`Unsupported table: ${table}`);
      }
    } catch (_error) {
      // If Airtable fetch fails, the service layer already falls back to mock data
      // But we need to update the source indicator
      source = 'mock';
      
      // Re-fetch with mock data (the service layer handles this automatically)
      switch (table) {
        case 'events':
          data = await fetchEvents();
          break;
        case 'people':
          data = await fetchPeople();
          break;
        case 'media':
          data = await fetchMedia();
          break;
        case 'announcements':
          data = await fetchAnnouncements();
          break;
      }
    }

    const response: ApiResponse<unknown> = {
      data,
      source,
      configured,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error('API route error:', error);
    
    const errorResponse: ErrorResponse = {
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// ── Export Route Config ─────────────────────────────────────────

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Ensure fresh data on each request
export const revalidate = 300; // Cache for 5 minutes