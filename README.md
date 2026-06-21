# Junsgram

An Instagram-style photo-sharing app — feed, post detail, likes, comments, bookmarks, follow,
user search, and photo upload.

## Tech Stack

- **Next.js 16** (App Router, Turbopack) · **React 19** · **TypeScript**
- **Auth.js v5** (Google OAuth)
- **Sanity** (content store + image hosting)
- **SWR** (client data fetching + optimistic updates)
- **Tailwind CSS**
- **zod** (API input validation) · **Vitest** (tests)

## Getting Started

### 1. Prerequisites

- Node.js **20+**
- A [Sanity](https://www.sanity.io/) project (with an **Editor** API token for writes)
- Google OAuth credentials (Google Cloud Console)

### 2. Environment variables

Copy the example file and fill in real values:

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `GOOGLE_OAUTH_ID` / `GOOGLE_OAUTH_SECRET` | Google OAuth client credentials |
| `NEXTAUTH_URL` | App base URL (e.g. `http://localhost:3000`) |
| `NEXTAUTH_SECRET` | Random secret (`openssl rand -base64 32`) |
| `SANITY_STUDIO_SANITY_PROJECT_ID` / `SANITY_STUDIO_SANITY_DATASET` | Sanity project + dataset |
| `SANITY_SECRET_TOKEN` | Sanity **Editor** token (read **and** write) |
| `ADMIN_ID` | Server-only admin username (authoritative) |
| `NEXT_PUBLIC_ADMIN_ID` | Client-side admin UI affordance only |

> The Sanity token must have **Editor** (write) permission, or likes/comments/follow/post
> creation will fail with a 403. A read-only (Viewer) token only supports browsing.

### 3. Install & run

```bash
npm install
npm run dev      # http://localhost:3000
```

## Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Run the Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Run the Playwright E2E suite (builds + serves the app) |
| `npm run seed` | Seed dummy posts into Sanity (`-- --count=N`, `--clean`) |

## Project Structure

```
src/
  app/            Routes + API route handlers
  components/     UI (+ ui/, ui/icons/)
  context/        Auth / SWR providers, cache-key context
  hooks/          SWR data hooks
  lib/            Cross-cutting utils (http, validation, fetcher)
  model/          Domain types
  service/        Sanity data access
  util/           Session helpers, date formatting
  auth.ts         Auth.js v5 (Node) config
  auth.config.ts  Auth.js v5 edge-safe base config
  proxy.ts        Route protection (Next 16 proxy convention)
```

See [`REFACTORING.md`](./REFACTORING.md) for the renewal plan and progress.
