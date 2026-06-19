# Junsgram — Refactoring Plan

A full renewal of the Junsgram project (an Instagram-style photo-sharing app).
This document tracks what needs to be refactored, why, and the current progress.

- **Target Stack:** Next.js 16.2.x / React 19 (required) / Auth.js v5 / TypeScript (es2022) / Node 20+ / Sanity.
- **Working Rules:** Each phase runs on its own branch; at the end of every phase, run the smoke test (login / create post / like / comment / follow) to confirm the app is not broken before merging.

## Project Overview

- **Type:** Instagram clone — feed, post detail, likes, comments, bookmarks, follow, user search, photo upload.
- **Current stack:** Next.js 13.5.6 (App Router), React 18, TypeScript, Tailwind CSS, SWR, NextAuth v4 (Google OAuth), Sanity (CMS / data store + image hosting).
- **Structure:**
  - `src/app` — routes + API route handlers
  - `src/components` (+ `components/ui`, `components/ui/icons`) — UI
  - `src/service` — Sanity data access (`posts.ts`, `user.ts`, `sanity.ts`)
  - `src/hooks` — SWR data hooks (`posts.ts`, `post.ts`, `me.ts`, `debounce.ts`)
  - `src/model` — domain types
  - `src/context` — Auth / SWR providers, cache-key context
  - `src/util` — `session.ts`, `date.ts`
  - `sanity-studio/` — separate Sanity Studio project

Legend: `[ ]` todo · `[~]` in progress · `[x]` done · **P0** critical · **P1** high · **P2** medium · **P3** low

---

## 1. Security (P0)

- [x] **GROQ injection (read queries)** — all `client.fetch` queries in `src/service/posts.ts` and
  `src/service/user.ts` were parameterized (`$username` / `$id` / `$postId` / `$match`), replacing the
  former string interpolation (`username == "${username}"`, `match "*${keyword}*"`, `_id == "${id}"`).
  Done in Phase 1.
- [ ] **Residual: patch `.unset()` selectors** — `dislikePost`, `deleteComment`, `removeBookmark`,
  `follow`/`unfollow` interpolate client-supplied IDs into GROQ-filter selectors
  (e.g. `likes[_ref=="${userId}"]`). Sanity patch selectors do **not** accept `$param` placeholders, so
  these need **ID-shape validation** before use — fold into the Phase 5 zod validation pass.
- [x] **Broken query logic / operator precedence** — `searchUsers` previously built
  `*[_type == "user" && (name match ...) || (username match ...)]`, where the unparenthesized `&&`/`||`
  mix broke the type filter. Now `&& (name match $match || username match $match)`. Done in Phase 1.
- [ ] **Server-derived identity for ALL mutation APIs** — like, bookmark, comment, follow, and delete
  must derive the acting user from the **server session**, NOT from a client-supplied `userId`.
  This prevents actor spoofing (acting on behalf of another user). Today several handlers trust the
  request body / client. Additionally, the `DELETE /api/posts` handler performs **no** ownership/admin
  check server-side — ownership is only enforced in `PostDetail.tsx` on the client.
  *Depends on the session API: implement together with / right after the Auth.js v5 migration (Phase 3)
  so it isn't written twice.*
- [ ] **Secret rotation (conditional / mandatory)** — `.env.local` (gitignored, not currently committed)
  holds a live Google OAuth secret, Sanity write token, and NextAuth secret. **Scan git history**; if
  these were committed even once, rotation is **mandatory** (Sanity token + OAuth secret + NextAuth
  secret). Document required env vars in `.env.example`.
- [ ] **Admin exposed via public env** — `NEXT_PUBLIC_ADMIN_ID` ships to the client. Move admin checks
  server-side (folds into the server-derived identity work above).
- [ ] **File upload validation (security cross-ref, see §3)** — validate type/size/count on the server
  to block malicious or oversized uploads, not only for UX.

## 2. Dependency & Framework Upgrades (P1)

- [ ] **Next.js 13.5.6 → 16.2.x** — go straight to 16; Next 15 LTS reaches end-of-support in Oct 2026,
  so skip it. Review the new caching model (handle alongside §6).
- [ ] **Async Request APIs (Next 15+ breaking change)** — `cookies()`, `headers()`, and route handler
  `params` are now async. This affects `src/util/session.ts` and auth-related code broadly; audit every
  usage. *This is the biggest migration pitfall — track it explicitly.*
- [ ] **React 18 → 19** — React 19 is a **required** dependency of Next 16, not optional.
- [ ] **NextAuth v4 → Auth.js v5** — new config style. The v5 migration also removes the
  `authOptions`-exported-from-`route.ts` anti-pattern entirely (v5 has no `authOptions` export), so no
  separate extraction task is needed (see §4).
- [ ] **tsconfig `target: es5` → `es2022`** — es5 is obsolete for a Node 20+ / modern-browser app.
- [ ] **`next.config.js` `images.domains` is deprecated** → migrate to `images.remotePatterns`.
- [ ] **Turbopack** is the **default bundler** in Next 16 (not an opt-in to "adopt") — validate the build
  works under it.
- [ ] Audit remaining deps (`react-multi-carousel`, `react-spinners`, `timeago.js`) for current versions.

## 3. Bugs & Correctness (P1 unless noted)

- [ ] **`PostDetail.tsx` alt text** — `alt={`photo by ${data.username[index]}`}`: `username` is a string,
  so indexing yields a single character. Use `data.username`.
- [ ] **`deleteTargetPost` error handling** (`hooks/posts.ts`) — `.catch((err) => err.json())` calls
  `.json()` on an Error; broken fallback. Fix error propagation.
- [ ] **`NewPost` upload validation** — no client-side validation of file type/size/count; the server
  loop trusts the `length` field blindly. Validate on both ends (security cross-ref, §1).
- [ ] **(P2/P3) `key={index}` in slide loops** (`PostDetail`) — low impact; prefer stable keys when
  touching the component.

## 4. Architecture & Structure (P2)

- [ ] **Input validation layer** — add `zod` schemas for all API request bodies/forms (posts, comments,
  likes, bookmarks, follow) instead of ad-hoc `if (!id || x == null)` checks.
- [ ] **Standardized API error responses** — handlers are inconsistent: some return
  `new Response(JSON.stringify(error), {500})`, some `NextResponse`. Introduce an error helper + shape.
- [ ] **Unified fetcher / error handling** — `SWRConfigContext`'s fetcher ignores non-2xx responses
  (calling `res.json()` on an error page throws opaquely). Add a fetcher that checks `res.ok`.
  > **Bundle the three items above as a single "API contract cleanup" pass** (Phase 5): zod validation +
  > standardized error responses + the `res.ok`-aware fetcher belong together.
- [ ] **Service layer typing** — many service functions return `any` from `client.fetch`. Add explicit
  return types and shared mappers.
- [ ] **Consolidate duplicate button components** — `components/ColorButton.tsx` vs
  `components/ui/ColorButton.tsx`, plus `ui/Button`, `ui/CommonButton`, `ui/LoginButton`,
  `ui/ToggleButton`. Collapse into one configurable `Button`.
- [ ] **Fix typo'd names** — `src/context/CacheKeysConttext.tsx` (file) and `CaacheKeysContext` (export)
  → `CacheKeysContext`. Update imports.
- [ ] **Folder convention** — introduce `src/lib` for cross-cutting utilities; clarify `service` vs `util`.
- [x] ~~Move `authOptions` out of `route.ts`~~ — **absorbed into the Auth.js v5 migration (§2)**; v5 has
  no `authOptions` export, so this resolves itself there. No standalone task.

## 5. Code Quality & Cleanup (P2)

- [ ] **Remove dead/commented code & debug logs** — many commented-out blocks and `// console.log(...)`
  across `service/posts.ts`, `hooks/*`, `components/NewPost.tsx`, the auth route, etc.
- [ ] **Translate / standardize comments** — extensive inline Korean comments; keep useful ones, convert
  to concise English, and drop comments that merely narrate the code.
- [ ] **ESLint/Prettier** — adopt a stricter shared config; run a repo-wide format pass; consider
  `eslint-plugin-tailwindcss`.
- [ ] **Extract magic strings** — API paths (`/api/posts`, `/api/me`, …) into a constants module.

## 6. Performance & UX (P3)

- [ ] **Caching strategy** — `sanity.ts` uses `useCdn: false` + `cache: 'no-store'` globally; reads pay
  full latency every time. Use CDN + tag-based revalidation for read queries.
  *Do this together with the Next 16 caching-model migration in §2.*
- [ ] **Pagination / infinite scroll** for the feed and profile grids (currently fetches all posts).
- [ ] **Loading & error states** — add error boundaries and skeletons; unify spinner usage
  (`GridSpinner` vs `react-spinners`).
- [ ] **Accessibility** — alt text, `aria-label`s on icon-only buttons, focus states for modals.
- [ ] **Image optimization** — verify `sizes` props and responsive widths in `urlFor` (fixed at 800px).

## 7. Testing & Tooling (P2)

> Promoted from P3: for a full-renewal portfolio repo, tests + CI are a core selling point.

- [ ] **No tests exist** — add unit tests for services/hooks (Vitest) and component/E2E tests
  (Playwright) for core flows (login, create post, like, comment, follow).
- [ ] **CI** — lint + typecheck + test on PR.
- [ ] **`.env.example`** + README setup/run instructions.

---

## Phased Plan

Ordered by dependency, not by section number. Each phase = its own branch + smoke test before merge.

### Phase 1 — GROQ parameterization & query fixes (P0, framework-independent)
- Parameterize all GROQ queries in `service/posts.ts` and `service/user.ts`.
- Fix the `searchUsers` operator-precedence bug.
- No framework changes — safe to land first.

### Phase 2 — Secret audit & rotation (P0, framework-independent)
- Scan git history for committed secrets; rotate (mandatory) if any are found.
- Add `.env.example` documenting required vars.

### Phase 3 — Auth.js v5 migration + server-derived identity (P0/P1)
- Migrate NextAuth v4 → Auth.js v5 (this removes the `authOptions`-from-`route.ts` anti-pattern).
- Update `util/session.ts` and all auth code for the **async Request APIs**.
- With the new session API in place, enforce server-derived identity + ownership/admin checks across
  **all** mutation APIs (like, bookmark, comment, follow, delete). Move admin check off the public env.
- Doing identity work here (not earlier) avoids writing it twice against the v4 API.

### Phase 4 — Next.js 16 / React 19 upgrade + caching model
- Upgrade to Next 16.2.x + React 19; validate the Turbopack default build.
- Migrate `images.domains` → `images.remotePatterns`; bump tsconfig `target` to es2022.
- Rework the Sanity caching strategy (CDN + tag-based revalidation) against the new caching model (§6).

### Phase 5 — API contract cleanup (one pass)
- zod input validation + standardized error responses + `res.ok`-aware fetcher, together.
- Add explicit service return types / shared mappers.

### Phase 6 — Architecture & code-quality cleanup
- Consolidate button components; fix `CacheKeysContext` typos; introduce `src/lib`.
- Remove dead code / debug logs; translate comments; ESLint/Prettier pass; extract magic strings.
- Fix remaining correctness items (alt text, `deleteTargetPost`, upload validation, slide keys).

### Phase 7 — Performance, UX, testing & CI
- Pagination/infinite scroll, loading/error boundaries, accessibility, image optimization.
- Vitest + Playwright test suites; CI (lint + typecheck + test on PR); README.
