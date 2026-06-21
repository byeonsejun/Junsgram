import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetcher } from './fetcher';

function mockFetch(response: Partial<Response> & { json: () => Promise<unknown> }) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('fetcher', () => {
  it('returns parsed JSON on a 2xx response', async () => {
    mockFetch({ ok: true, json: async () => ({ hello: 'world' }) });
    await expect(fetcher('/api/x')).resolves.toEqual({ hello: 'world' });
  });

  it('throws on a non-2xx response, using the error body message', async () => {
    mockFetch({ ok: false, status: 403, statusText: 'Forbidden', json: async () => ({ error: 'Forbidden' }) });
    await expect(fetcher('/api/x')).rejects.toThrow('403 Forbidden');
  });

  it('falls back to statusText when the body has no error field', async () => {
    mockFetch({ ok: false, status: 500, statusText: 'Internal Server Error', json: async () => ({}) });
    await expect(fetcher('/api/x')).rejects.toThrow('500 Internal Server Error');
  });
});
