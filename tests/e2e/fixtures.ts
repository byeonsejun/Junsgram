import { encode } from '@auth/core/jwt';
import type { BrowserContext, Page } from '@playwright/test';
import type { HomeUser } from '../../src/model/user';
import type { SimplePost } from '../../src/model/post';

// Auth.js v5 session cookie name on http (non-secure) origins like localhost.
const SESSION_COOKIE = 'authjs.session-token';

export const MOCK_USER: HomeUser = {
  id: 'test-user-id',
  name: 'Test User',
  username: 'qustpwns93',
  email: 'qustpwns93@gmail.com',
  image: 'https://cdn.sanity.io/images/dummy/avatar.png',
  following: [],
  followers: [],
  bookmarks: [],
};

// Build `count` posts with stable ids/text, optionally offset by `start` so
// different pages don't collide.
export function makePosts(count: number, start = 0): SimplePost[] {
  return Array.from({ length: count }, (_, i) => {
    const n = start + i;
    return {
      id: `post-${n}`,
      username: MOCK_USER.username,
      userImage: MOCK_USER.image!,
      image: [`https://cdn.sanity.io/images/dummy/post-${n}.png`],
      photos: [],
      text: `seed caption ${n}`,
      createdAt: new Date(Date.now() - n * 1000).toISOString(),
      likes: [],
      comments: 1,
    };
  });
}

// Mint a valid Auth.js session JWT and install it on the browser context so
// `auth()` (server) and useMe/middleware treat the user as logged in.
export async function loginAs(context: BrowserContext, user: HomeUser = MOCK_USER): Promise<void> {
  const token = await encode({
    salt: SESSION_COOKIE,
    secret: process.env.AUTH_SECRET!,
    token: { name: user.name, email: user.email, picture: user.image, id: user.id, sub: user.id },
  });
  await context.addCookies([
    { name: SESSION_COOKIE, value: token, domain: 'localhost', path: '/', httpOnly: true, sameSite: 'Lax' },
  ]);
}

// 1x1 transparent PNG so next/image requests resolve without hitting a real CDN.
const STUB_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64'
);

type MockApiOptions = {
  user?: HomeUser | null;
  /** posts returned per page index, e.g. [page0Posts, page1Posts]. */
  postsByPage?: SimplePost[][];
};

// Intercept the browser-side API calls the feed makes so tests stay
// deterministic and never touch Sanity. Mutations resolve with 200.
export async function mockApi(page: Page, { user = MOCK_USER, postsByPage = [] }: MockApiOptions = {}): Promise<void> {
  await page.route('**/_next/image**', (route) =>
    route.fulfill({ status: 200, contentType: 'image/png', body: STUB_PNG })
  );

  await page.route('**/api/me', (route) =>
    user
      ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(user) })
      : route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ error: 'Authentication Error' }) })
  );

  await page.route('**/api/posts**', (route) => {
    const method = route.request().method();
    if (method !== 'GET') {
      // like/comment/delete mutations: succeed so optimistic UI commits.
      return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    }
    const url = new URL(route.request().url());
    const pageIndex = Number(url.searchParams.get('page') ?? '0');
    const data = postsByPage[pageIndex] ?? [];
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(data) });
  });

  // Other mutations used by the feed (likes/comments/bookmarks).
  await page.route(/\/api\/(likes|comments|bookmarks|follow)/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  );
}
