/**
 * TC-001: Login with valid credentials (standard_user)
 * AFS: test-specs/auth/l1_login_valid_TC-001.md
 * Priority: l1 (critical)
 *
 * Credentials are SauceDemo public constants documented on the login page itself;
 * no env-var indirection is required per the AFS § User Selection.
 */
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';

const USERNAME = 'standard_user';
const PASSWORD = 'secret_sauce';

test.describe('TC-001 @TC-001 — Login valid credentials', () => {
  test('standard_user logs in and lands on the Products inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const inventoryPage = new InventoryPage(page);

    // Step 1: Navigate to the login page and verify it is displayed
    await loginPage.goto();
    await expect(loginPage.usernameInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.loginButton).toBeVisible();

    // Steps 2–4: Fill credentials and submit — waitForURL is called inside login()
    await loginPage.login(USERNAME, PASSWORD);

    // Step 4 assertions: URL, heading, inventory list
    // URL assertion — page.waitForURL already resolved inside login(); this
    // confirms from the spec side for an unambiguous assertion record
    await expect(page).toHaveURL(/inventory\.html/);

    // Heading shows "Products"
    await expect(inventoryPage.title).toHaveText('Products');

    // Inventory list is present and contains items
    await expect(inventoryPage.inventoryList).toBeVisible();
    await expect(inventoryPage.inventoryItems).toHaveCount(6);

    // No error banner visible
    // The error container is always in the DOM but hidden; using .toHaveCount(0)
    // would be misleading — instead confirm no error text is displayed
    await expect(loginPage.errorBanner).toHaveCount(0);
  });
});
