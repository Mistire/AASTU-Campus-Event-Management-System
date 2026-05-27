import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('User can navigate to login and fill the form', async ({ page }) => {
    // Navigate to the app
    await page.goto('/login');

    // Expect the title to contain "Login" or similar
    // Check if the email and password fields exist
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    const submitBtn = page.getByRole('button', { name: /sign in/i });

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitBtn).toBeVisible();

    // Fill in the credentials
    await emailInput.fill('student@aastu.edu.et');
    await passwordInput.fill('securePassword123!');

    // Submit the form
    // Since we don't have a live backend, we just assert the button is clickable
    await expect(submitBtn).toBeEnabled();
  });
});
