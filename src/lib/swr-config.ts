'use client';

import { authFetch } from '@/lib/auth-fetch';

export const authFetcher = async (url: string) => {
  const res = await authFetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  const data = await res.json();
  return data.data ?? data;
};

export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Fetch failed');
  const data = await res.json();
  return data.data ?? data;
};
