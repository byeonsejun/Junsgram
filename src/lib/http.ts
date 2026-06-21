import { NextResponse } from 'next/server';

// Standardized JSON error shape: { error: string }.
export function jsonError(status: number, message: string) {
  return NextResponse.json({ error: message }, { status });
}

export const badRequest = (message = 'Bad Request') => jsonError(400, message);
export const unauthorized = (message = 'Authentication Error') => jsonError(401, message);
export const forbidden = (message = 'Forbidden') => jsonError(403, message);
export const notFound = (message = 'Not Found') => jsonError(404, message);

// Map an unexpected thrown error to a Response. Upstream HTTP errors (e.g. a
// Sanity ClientError carrying a `statusCode`) are surfaced with their real
// status instead of being masked as an opaque 500; details are logged server
// side, never leaked to the client.
export function serverError(error: unknown) {
  const status = (error as { statusCode?: unknown })?.statusCode;
  if (typeof status === 'number' && status >= 400 && status < 600) {
    console.error(`[api] upstream error ${status}:`, error);
    const message = status === 403 ? 'Forbidden' : status === 404 ? 'Not Found' : 'Upstream Error';
    return jsonError(status, message);
  }
  console.error('[api] unexpected error:', error);
  return jsonError(500, 'Internal Server Error');
}
