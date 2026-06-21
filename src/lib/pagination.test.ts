import { describe, expect, it } from 'vitest';
import { normalizePage, parsePageParam, pageRange, POSTS_PAGE_SIZE } from './pagination';

describe('normalizePage', () => {
  it('returns the integer for valid non-negative input', () => {
    expect(normalizePage(0)).toBe(0);
    expect(normalizePage(3)).toBe(3);
    expect(normalizePage('2')).toBe(2);
  });

  it('floors fractional values', () => {
    expect(normalizePage(2.9)).toBe(2);
  });

  it('falls back to 0 for invalid or negative input', () => {
    expect(normalizePage(-1)).toBe(0);
    expect(normalizePage('abc')).toBe(0);
    expect(normalizePage(null)).toBe(0);
    expect(normalizePage(undefined)).toBe(0);
    expect(normalizePage(NaN)).toBe(0);
  });
});

describe('parsePageParam', () => {
  it('reads the page param, defaulting to 0 when absent', () => {
    expect(parsePageParam(new URLSearchParams(''))).toBe(0);
    expect(parsePageParam(new URLSearchParams('page=4'))).toBe(4);
    expect(parsePageParam(new URLSearchParams('page=-2'))).toBe(0);
  });
});

describe('pageRange', () => {
  it('computes [start...end) bounds from the page size', () => {
    expect(pageRange(0)).toEqual({ start: 0, end: POSTS_PAGE_SIZE });
    expect(pageRange(1)).toEqual({ start: POSTS_PAGE_SIZE, end: POSTS_PAGE_SIZE * 2 });
    expect(pageRange(2)).toEqual({ start: POSTS_PAGE_SIZE * 2, end: POSTS_PAGE_SIZE * 3 });
  });

  it('clamps invalid pages to the first page', () => {
    expect(pageRange(-5)).toEqual({ start: 0, end: POSTS_PAGE_SIZE });
  });
});
