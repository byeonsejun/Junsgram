import { describe, expect, it, vi } from 'vitest';
import { badRequest, forbidden, jsonError, notFound, serverError } from './http';

describe('http error helpers', () => {
  it('jsonError sets status and { error } body', async () => {
    const res = jsonError(418, "I'm a teapot");
    expect(res.status).toBe(418);
    await expect(res.json()).resolves.toEqual({ error: "I'm a teapot" });
  });

  it('named helpers use their canonical status codes', () => {
    expect(badRequest().status).toBe(400);
    expect(forbidden().status).toBe(403);
    expect(notFound().status).toBe(404);
  });

  it('serverError surfaces an upstream statusCode instead of masking it as 500', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const sanity403 = Object.assign(new Error('Insufficient permissions'), { statusCode: 403 });
    const res = serverError(sanity403);
    expect(res.status).toBe(403);
    await expect(res.json()).resolves.toEqual({ error: 'Forbidden' });
  });

  it('serverError falls back to 500 for errors without a statusCode', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = serverError(new Error('boom'));
    expect(res.status).toBe(500);
    await expect(res.json()).resolves.toEqual({ error: 'Internal Server Error' });
  });
});
