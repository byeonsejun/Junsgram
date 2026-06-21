// Shared pagination constants/helpers used by both server (service/API) and
// client (useSWRInfinite). Keeping the page size in one place ensures the
// client can detect "last page" by comparing a page's length to POSTS_PAGE_SIZE.

// Small page size so infinite scroll is observable even with modest seed data.
export const POSTS_PAGE_SIZE = 5;

// Coerce an untrusted `page` value into a safe, non-negative integer.
export function normalizePage(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.floor(n);
}

// Parse the `page` query param from a request URL's search params (default 0).
export function parsePageParam(searchParams: URLSearchParams): number {
  return normalizePage(searchParams.get('page'));
}

// GROQ slice bounds for a given page: `[start...end]` (end exclusive).
export function pageRange(page: number): { start: number; end: number } {
  const safe = normalizePage(page);
  const start = safe * POSTS_PAGE_SIZE;
  return { start, end: start + POSTS_PAGE_SIZE };
}
