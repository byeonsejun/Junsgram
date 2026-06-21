import { test, expect } from '@playwright/test';
import { loginAs, mockApi, makePosts } from './fixtures';

test.describe('feed (authenticated)', () => {
  test.beforeEach(async ({ context }) => {
    await loginAs(context);
  });

  test('renders the posts returned by the first page', async ({ page }) => {
    await mockApi(page, { postsByPage: [makePosts(3)] });
    await page.goto('/');

    await expect(page.getByText('seed caption 0')).toBeVisible();
    await expect(page.getByText('seed caption 2')).toBeVisible();
    await expect(page.locator('article')).toHaveCount(3);
  });

  test('liking a post updates the count optimistically', async ({ page }) => {
    await mockApi(page, { postsByPage: [makePosts(1)] });
    await page.goto('/');

    const article = page.locator('article').first();
    await expect(article.getByText('0 like')).toBeVisible();

    await article.getByRole('button', { name: 'like', exact: true }).click();

    await expect(article.getByText('1 like')).toBeVisible();
    // Button flips to the "unlike" affordance.
    await expect(article.getByRole('button', { name: 'unlike', exact: true })).toBeVisible();
  });

  test('infinite scroll loads the next page', async ({ page }) => {
    await mockApi(page, { postsByPage: [makePosts(5, 0), makePosts(3, 5)] });
    await page.goto('/');

    await expect(page.getByText('seed caption 0')).toBeVisible();
    await expect(page.getByText('seed caption 5')).toHaveCount(0);

    const page1 = page.waitForResponse(
      (r) => r.url().includes('/api/posts') && new URL(r.url()).searchParams.get('page') === '1'
    );
    // The scroll container is <body> (globals.css: height:100vh; overflow:auto),
    // not the window — scroll it to the bottom to trip the sentinel observer.
    await page.evaluate(() => document.body.scrollTo(0, document.body.scrollHeight));
    await page1;

    await expect(page.getByText('seed caption 5')).toBeVisible();
    await expect(page.getByText('seed caption 7')).toBeVisible();
  });
});
