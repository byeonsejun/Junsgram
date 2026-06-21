import { test, expect } from '@playwright/test';
import { loginAs, mockApi, makePosts } from './fixtures';

test.describe('unauthenticated', () => {
  test('visiting / redirects to the sign-in page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/api\/auth\/signin/);
    await expect(page.getByRole('button', { name: 'Sign in with Google' })).toBeVisible();
  });
});

test.describe('authenticated', () => {
  test.beforeEach(async ({ context }) => {
    await loginAs(context);
  });

  test('a logged-in user lands on the feed (no redirect)', async ({ page }) => {
    await mockApi(page, { postsByPage: [makePosts(1)] });
    await page.goto('/');
    await expect(page).toHaveURL('/');
    await expect(page.getByText('seed caption 0')).toBeVisible();
  });
});
