'use client';

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(input, init);

  if (res.status === 401) {
    const refreshRes = await fetch('/api/auth/refresh', { method: 'POST' });

    if (refreshRes.ok) {
      res = await fetch(input, init);
    } else if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }

  return res;
}
