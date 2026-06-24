# Test Case: Login with Valid Credentials (standard_user)

## Metadata
- **TMS ID**: TC-001
- **Linked Story**: none
- **Priority**: l1 (critical)
- **Environment Explored**: production (https://www.saucedemo.com)
- **Analyst**: qa-engineer agent
- **Status**: ready-for-automation

---

## User Selection

Credentials used during exploration:

| Field    | Value           | Source              |
|----------|-----------------|---------------------|
| username | `standard_user` | hardcoded in TC-001 |
| password | `secret_sauce`  | hardcoded in TC-001 |

SauceDemo exposes all valid usernames on the login page itself (in a
credentials hint box). `standard_user` is the canonical "happy path"
user — no artificial slowdowns, no locked state, no visual glitches.

---

## Preconditions

- Browser is open with no active session (cookies cleared / fresh context).
- User is NOT logged in; navigating to `${BASE_URL}/inventory.html` would
  redirect to the login page.

---

## Test Data

### Existing (reuse-existing)
- `username` = `standard_user` — constant, no per-test generation needed
- `password` = `secret_sauce` — constant, no per-test generation needed
- `${BASE_URL}` = `https://www.saucedemo.com` (from `playwright.config.ts` `use.baseURL`)

### Must Generate (generate-per-test)
- None.

### Must Clean Up (generate-shared-with-cleanup)
- None. TC-001 teardown is explicitly "None — leave browser on Products page."
  The automation framework's `beforeEach` (or a fresh browser context per test)
  handles session isolation. No explicit teardown step required in the spec.

---

## Test Steps

1. Navigate to `${BASE_URL}` (root, which serves the login page).
   - **Verify**: Login page is displayed — Username input, Password input, and
     Login button are all visible.

2. Fill the Username field with `standard_user`.
   - **Verify**: Input contains the value `standard_user`.

3. Fill the Password field with `secret_sauce`.
   - **Verify**: Password field is filled (value is masked).

4. Click the Login button.
   - **Verify**:
     - URL changes to `${BASE_URL}/inventory.html`.
     - The page heading `data-test="title"` contains the text **"Products"**.
     - The inventory list `data-test="inventory-list"` is present and contains
       at least one item (`data-test="inventory-item"`).
     - No error banner is visible on the page.
     - No application-level console errors (see Known Console Noise below).

---

## Expected Results

- Final URL: `https://www.saucedemo.com/inventory.html`
- Page heading: "Products" (span with `data-test="title"`)
- Inventory list rendered with 6 items (observed during exploration)
- No login error message visible
- `data-test="inventory-container"` present in DOM

---

## Cleanup

None — TC-001 explicitly specifies no teardown. The automation framework
must use an isolated browser context (or `beforeEach` session clear) so
each test run starts from a logged-out state without manual cleanup.

---

## Stable Selectors (discovered during live exploration)

All selectors verified against the live DOM at `https://www.saucedemo.com`
on 2026-06-24 using `document.querySelectorAll('[data-test]')`.

### LoginPage (`pages/LoginPage.ts`)

| Element        | Primary Locator                                   | Fallback                                      | Notes |
|----------------|---------------------------------------------------|-----------------------------------------------|-------|
| Username input | `page.getByRole('textbox', { name: 'Username' })` | `page.locator('[data-test="username"]')`       | `type="text"`, `placeholder="Username"`, `id="user-name"` |
| Password input | `page.getByRole('textbox', { name: 'Password' })` | `page.locator('[data-test="password"]')`       | `type="password"`, `placeholder="Password"`, `id="password"` |
| Login button   | `page.getByRole('button', { name: 'Login' })`     | `page.locator('[data-test="login-button"]')`   | `type="submit"`, `id="login-button"` |

> Note: The Login button is technically an `<input type="submit">`, not a
> `<button>`. Playwright's `getByRole('button')` resolves it correctly
> because ARIA maps `input[type=submit]` to the button role. The
> `data-test="login-button"` fallback is unambiguous and preferred by the
> project's locator strategy (`role → testid`).

### InventoryPage (`pages/InventoryPage.ts`)

| Element               | Primary Locator                                 | Fallback                                          | Notes |
|-----------------------|-------------------------------------------------|---------------------------------------------------|-------|
| Page title / heading  | `page.locator('[data-test="title"]')`           | `page.getByText('Products', { exact: true })`     | `<span>` — no ARIA heading role; testid is cleaner |
| Inventory container   | `page.locator('[data-test="inventory-container"]')` | `page.locator('[data-test="inventory-list"]')` | Outer wrapper |
| Inventory list        | `page.locator('[data-test="inventory-list"]')`  | `.inventory_list` (CSS — last resort)             | Direct parent of items |
| Individual items      | `page.locator('[data-test="inventory-item"]')`  | n/a                                               | Returns 6 elements; use `.count()` or `.first()` |

---

## Network Behavior

The login form submission does not fire an XHR/fetch API call — it is a
standard HTML form POST. Playwright's `waitForURL('/inventory.html')` is
the correct wait strategy after clicking Login; no `waitForResponse` needed.

**Known console noise (not a product defect):**

Six `401 Unauthorized` errors from `https://events.backtrace.io` appear
on every page load. These originate from SauceDemo's bundled Backtrace
error-monitoring SDK attempting to contact its cloud endpoint with invalid
demo credentials. They are infrastructure noise unrelated to the
application under test. Automation should NOT assert on console error
absence globally — instead, filter for errors originating from the
saucedemo.com domain if console checks are needed.

---

## Known Defects Found

None found. The happy-path login flow for `standard_user` completed
without error. The `401` errors in the browser console are third-party
infrastructure noise (Backtrace SDK), not application defects.

---

## Blocked Steps

None. All four steps of TC-001 executed successfully to completion.

---

## Automation Hints

- **Framework**: Playwright TypeScript (confirmed from `.agents/testing.md`)
- **Page objects to create**:
  - `pages/LoginPage.ts` — encapsulates username input, password input,
    login button, and a `login(username, password)` method that fills both
    fields and clicks Login, then awaits navigation to `/inventory.html`.
  - `pages/InventoryPage.ts` — encapsulates the title locator and inventory
    list; expose a `waitForLoad()` method that asserts `[data-test="title"]`
    contains "Products".
- **Wait strategy**: `await page.waitForURL('**/inventory.html')` after
  clicking Login; no fixed timeout.
- **Console filter**: If the test suite checks for console errors, exclude
  messages from `events.backtrace.io` — they will always fire and are not
  test failures.
- **Spec location**: `tests/login-valid.spec.ts`
- **Fixture**: No auth fixture needed for this test (it IS the auth test).
  Later specs that need a pre-authenticated state can save storage state
  from a successful run of this test.

---

## Evidence

- Screenshot — login page (before): `test-results/screenshots/TC-001-step-1-login-page.png`
- Screenshot — products page (after login): `test-results/screenshots/TC-001-step-4-products-page.png`
- Console messages: 6 errors (all from `events.backtrace.io` — known noise, not app defects)
- DOM introspection: all `data-test` attributes verified via `document.querySelectorAll('[data-test]')` on live page
