import { describe, expect, it } from 'vitest';
import {
  addCommentSchema,
  bookmarkSchema,
  deleteCommentSchema,
  deletePostSchema,
  followSchema,
  likeSchema,
  sanityId,
} from './validation';

describe('sanityId', () => {
  it('accepts valid Sanity ids', () => {
    expect(sanityId.safeParse('102729254143522090029').success).toBe(true);
    expect(sanityId.safeParse('drafts.abc-123_xyz').success).toBe(true);
  });

  it('rejects empty and oversized ids', () => {
    expect(sanityId.safeParse('').success).toBe(false);
    expect(sanityId.safeParse('a'.repeat(256)).success).toBe(false);
  });

  it('rejects ids containing GROQ-injection characters', () => {
    // these would break out of a `.unset()` selector like likes[_ref=="<id>"]
    for (const bad of ['x"]', 'a"==1//', 'id with space', 'a*b', "a']|", 'a&&b']) {
      expect(sanityId.safeParse(bad).success).toBe(false);
    }
  });
});

describe('mutation body schemas', () => {
  it('likeSchema requires a valid id and boolean like', () => {
    expect(likeSchema.safeParse({ id: 'abc', like: true }).success).toBe(true);
    expect(likeSchema.safeParse({ id: 'abc', like: 'yes' }).success).toBe(false);
    expect(likeSchema.safeParse({ id: 'abc' }).success).toBe(false);
    expect(likeSchema.safeParse(null).success).toBe(false);
  });

  it('bookmarkSchema and followSchema mirror the boolean+id shape', () => {
    expect(bookmarkSchema.safeParse({ id: 'p1', bookmark: false }).success).toBe(true);
    expect(followSchema.safeParse({ id: 'u1', follow: true }).success).toBe(true);
    expect(bookmarkSchema.safeParse({ id: 'p1', bookmark: 1 }).success).toBe(false);
  });

  it('addCommentSchema trims and bounds the comment', () => {
    expect(addCommentSchema.safeParse({ id: 'p1', comment: 'hi' }).success).toBe(true);
    expect(addCommentSchema.safeParse({ id: 'p1', comment: '   ' }).success).toBe(false);
    expect(addCommentSchema.safeParse({ id: 'p1', comment: 'a'.repeat(1001) }).success).toBe(false);
  });

  it('deleteCommentSchema and deletePostSchema validate their ids', () => {
    expect(deleteCommentSchema.safeParse({ id: 'p1', key: 'k1' }).success).toBe(true);
    expect(deleteCommentSchema.safeParse({ id: 'p1', key: 'k"]' }).success).toBe(false);
    expect(deletePostSchema.safeParse({ postId: 'p1' }).success).toBe(true);
    expect(deletePostSchema.safeParse({ postId: '' }).success).toBe(false);
  });
});
