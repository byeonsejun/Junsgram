// Shared client-side fetch helper. Throws on non-2xx responses so that:
//  - SWR surfaces load errors (instead of caching an error body), and
//  - optimistic mutations roll back (SWR's rollbackOnError needs a rejection).
export async function fetcher<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message = (body as { error?: string } | null)?.error ?? res.statusText;
    throw new Error(`${res.status} ${message}`);
  }
  return res.json();
}
