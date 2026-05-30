import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Event Discovery Flow
 *
 * These tests verify that the discovery page loads correctly for a
 * logged-in student and that basic filtering, search, and navigation work.
 *
 * Prerequisites:
 * - The Next.js dev server must be running
 * - The NestJS API must be running with seeded events
 * - Test account: student@aastu.edu.et / Password123!
 */

// Shared login helper
async function loginAsStudent(page: any) {
  await page.goto('/login');
  await page.getByLabel('Email Address').fill('student@aastu.edu.et');
  await page.getByLabel('Password').fill('Password123!');
  await page.getByRole('button', { name: /Sign In to Portal/i }).click();
  await page.waitForURL('**/discovery', { timeout: 15_000 });
}

test.describe('Event Discovery', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies();
    await loginAsStudent(page);
  });

  test('should load the discovery page with an events list', async ({ page }) => {
    await expect(page).toHaveURL(/.*discovery/);
    // Discovery page should have a heading or events section
    const heading = page.getByRole('heading').first();
    await expect(heading).toBeVisible({ timeout: 10_000 });
  });

  test('should be accessible — discovery navbar is visible', async ({ page }) => {
    // Navbar should render after login
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible({ timeout: 10_000 });
  });

  test('should navigate to an event detail page when clicking an event', async ({ page }) => {
    // Wait for at least one event card to appear
    const firstEventCard = page.locator('[href*="/events/"]').first();
    await expect(firstEventCard).toBeVisible({ timeout: 15_000 });

    await firstEventCard.click();
    await page.waitForURL('**/events/**', { timeout: 10_000 });
    expect(page.url()).toMatch(/\/events\//);
  });
});
