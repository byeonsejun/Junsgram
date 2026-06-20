import { z } from 'zod';

// Sanity document/reference ids and array `_key`s are restricted to this
// character set. Validating against it also hardens the patch `.unset()`
// selectors that interpolate ids (e.g. `likes[_ref=="<id>"]`), which cannot
// use GROQ parameters — closing the Phase 1 injection residual.
const SANITY_ID = /^[a-zA-Z0-9._-]+$/;
export const sanityId = z.string().min(1).max(255).regex(SANITY_ID, 'Invalid id');

export const likeSchema = z.object({
  id: sanityId,
  like: z.boolean(),
});

export const bookmarkSchema = z.object({
  id: sanityId,
  bookmark: z.boolean(),
});

export const followSchema = z.object({
  id: sanityId,
  follow: z.boolean(),
});

export const addCommentSchema = z.object({
  id: sanityId,
  comment: z.string().trim().min(1).max(1000),
});

export const deleteCommentSchema = z.object({
  id: sanityId,
  key: sanityId,
});

export const deletePostSchema = z.object({
  postId: sanityId,
});
