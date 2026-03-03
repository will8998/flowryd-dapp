'use client';

let refreshPromise: Promise<Response> | null = null;

export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  let res = await fetch(input, init);

  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = fetch('/api/auth/refresh', { method: 'POST' })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const refreshRes = await refreshPromise;

    if (refreshRes.ok) {
      res = await fetch(input, init);
    } else {
      window.location.href = '/login';
    }
  }

  return res;
}
