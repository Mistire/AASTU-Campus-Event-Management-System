import { test, expect } from '@playwright/test';

/**
 * E2E Tests — Authentication Flows
 *
 * These tests verify real login, redirection, and session behavior
 * using a real browser (Chromium) against the running Next.js dev server.
 *
 * Prerequisites:
 * - The Next.js dev server must be running (npm run dev --prefix apps/web)
 * - The NestJS API must be running with seeded test users
 *
 * Test accounts (must exist in the database):
 * - Student:   student@aastu.edu.et / Password123!
 * - Admin:     admin@aastu.edu.et   / Password123!
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear auth cookies between tests
    await page.context().clearCookies();
  });

  test('should display the login form correctly', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel('Email Address')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /Sign In to Portal/i })).toBeVisible();
  });

  test('should show error toast on invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('wrong@aastu.edu.et');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: /Sign In to Portal/i }).click();

    // Error toast should appear
    await expect(page.getByText(/Login Failed/i)).toBeVisible({ timeout: 10_000 });
  });

  test('should redirect a STUDENT to /discovery after successful login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('student@aastu.edu.et');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /Sign In to Portal/i }).click();

    await page.waitForURL('**/discovery', { timeout: 15_000 });
    expect(page.url()).toContain('/discovery');
  });

  test('should redirect an ADMIN to /dashboard after successful login', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Email Address').fill('admin@aastu.edu.et');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /Sign In to Portal/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 15_000 });
    expect(page.url()).toContain('/dashboard');
  });
});

test.describe('Route Protection', () => {
  test('should redirect unauthenticated users from /dashboard to /login', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/dashboard');

    await page.waitForURL('**/login**', { timeout: 10_000 });
    expect(page.url()).toContain('/login');
    expect(page.url()).toContain('redirectTo');
  });

  test('should redirect an already-logged-in ADMIN away from /login to /dashboard', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.getByLabel('Email Address').fill('admin@aastu.edu.et');
    await page.getByLabel('Password').fill('Password123!');
    await page.getByRole('button', { name: /Sign In to Portal/i }).click();
    await page.waitForURL('**/dashboard', { timeout: 15_000 });

    // Now try to navigate back to /login
    await page.goto('/login');
    await page.waitForURL('**/dashboard', { timeout: 10_000 });
    expect(page.url()).toContain('/dashboard');
  });
});
